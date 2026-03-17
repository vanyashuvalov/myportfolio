/**
 * PageManager - Orchestrates page rendering and transitions
 */
import { Router } from './router.js';
import { ProjectPageHandler } from './project-page-handler.js';
import { ProjectsListPageHandler } from './projects-list-page-handler.js';
import { FunGalleryPageHandler } from './fun-gallery-page-handler.js';

export class PageManager {
  constructor(options = {}) {
    this.eventBus = options.eventBus;

    this.pageContainer = null;
    this.transitionOverlay = null;
    this.desktopCanvasEl = null;

    this.isPageMode = false;
    this.viewportTestCleanup = null;

    this.projectHandler = null;
    this.projectsListHandler = null;
    this.funGalleryHandler = null;

    this.router = new Router({ eventBus: this.eventBus });

    this.initialize();
  }

  initialize() {
    this.createPageContainer();
    this.createTransitionOverlay();
    this.initHandlers();
    this.registerRoutes();
    this.handleInitialRoute();
  }

  createPageContainer() {
    this.pageContainer = document.createElement('div');
    this.pageContainer.id = 'page-container';
    this.pageContainer.className = 'page-container';
    this.pageContainer.style.display = 'none';

    this.desktopCanvasEl = document.getElementById('desktop-canvas');

    if (this.desktopCanvasEl && this.desktopCanvasEl.parentNode) {
      this.desktopCanvasEl.parentNode.insertBefore(this.pageContainer, this.desktopCanvasEl.nextSibling);
    } else {
      document.body.appendChild(this.pageContainer);
    }
  }

  createTransitionOverlay() {
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.id = 'page-transition-overlay';
    this.transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(this.transitionOverlay);
  }

  initHandlers() {
    const handlerOptions = {
      eventBus: this.eventBus,
      pageContainer: this.pageContainer
    };

    this.projectHandler = new ProjectPageHandler(handlerOptions);
    this.projectsListHandler = new ProjectsListPageHandler(handlerOptions);
    this.funGalleryHandler = new FunGalleryPageHandler(handlerOptions);

    this.bindHandlerEvents();
  }

  bindHandlerEvents() {
    if (!this.eventBus) {
      console.error('EventBus is null in bindHandlerEvents');
      return;
    }

    this.eventBus.on('page:close', () => {
      this.router.navigate('/');
    });

    this.eventBus.on('page:backToProjects', ({ category } = {}) => {
      const url = category === 'fun' ? '/fun' : '/projects';
      this.router.navigate(url);
    });

    this.eventBus.on('page:navigateToProject', ({ projectId, category } = {}) => {
      if (!projectId) return;
      const url = category === 'fun' ? `/fun/${projectId}` : `/projects/${projectId}`;
      this.router.navigate(url);
    });
  }

  registerRoutes() {
    this.router.register('/projects/:id', async (context) => {
      const id = context.params.id;
      if (!id || id === 'work' || id === 'fun') {
        this.showProjectsListPage(id || 'work');
      } else {
        this.showProjectPage(id, 'work');
      }
    });

    this.router.register('/projects', () => this.showProjectsListPage('work'));
    this.router.register('/fun', () => this.showFunGalleryPage());
    this.router.register('/fun/:id', (context) => this.showProjectPage(context.params.id, 'fun'));
    this.router.register('/viewport-test', () => this.showViewportTestPage());
    this.router.register('/', () => this.showDesktopCanvas());
  }

  handleInitialRoute() {
    this.router.handleRoute(window.location.pathname);
  }

  async showProjectPage(projectId, category = 'work') {
    return this.showPage({
      type: 'project',
      withOverlay: true,
      load: () => this.projectHandler.load(projectId, category),
      render: (data) => this.projectHandler.render(data),
      setup: (data) => this.projectHandler.setupEvents(data),
      eventPayload: { projectId, category }
    });
  }

  async showProjectsListPage(category = 'work') {
    return this.showPage({
      type: 'projects-list',
      withOverlay: true,
      load: () => this.projectsListHandler.load(category),
      render: (data) => this.projectsListHandler.render(data),
      setup: (data) => this.projectsListHandler.setupEvents(data),
      eventPayload: { category }
    });
  }

  async showFunGalleryPage() {
    return this.showPage({
      type: 'fun-gallery',
      withOverlay: true,
      load: () => this.funGalleryHandler.load(),
      render: (data) => this.funGalleryHandler.render(data),
      setup: () => this.funGalleryHandler.setupEvents()
    });
  }

  async showPage({ load, render, setup, type, eventPayload = {}, withOverlay = false }) {
    try {
      this.cleanupViewportTest();
      this.setPageMode(true);
      if (withOverlay) this.toggleOverlay(true);
      this.hideDesktopCanvas();
      this.pageContainer.style.display = 'block';
      this.pageContainer.innerHTML = '';
      this.pageContainer.scrollTop = 0;

      const data = await load();
      this.pageContainer.innerHTML = render(data);
      if (setup) await setup(data);

      if (withOverlay) this.toggleOverlay(false);
      this.isPageMode = true;
      this.eventBus?.emit('page:shown', { type, ...eventPayload });
    } catch (error) {
      console.error(`Failed to show ${type} page:`, error);
      if (withOverlay) this.toggleOverlay(false);
      this.showErrorPage(error.message);
    }
  }

  async showDesktopCanvas() {
    this.cleanupViewportTest();

    this.pageContainer.style.display = 'none';
    this.pageContainer.innerHTML = '';

    this.setPageMode(false);

    if (this.desktopCanvasEl) {
      this.desktopCanvasEl.style.display = 'flex';
      this.desktopCanvasEl.style.opacity = '1';
    }

    this.isPageMode = false;

    this.projectHandler?.destroy();
    this.funGalleryHandler?.destroy();

    this.eventBus?.emit('page:hidden', { type: 'desktop-canvas' });
  }

  async showViewportTestPage() {
    try {
      this.cleanupViewportTest();
      document.body.classList.add('viewport-test');
      document.documentElement.classList.add('viewport-test');

      this.setPageMode(false);
      this.hideDesktopCanvas();
      this.pageContainer.style.display = 'block';
      this.pageContainer.innerHTML = this.renderViewportTestPage();

      const backBtn = this.pageContainer.querySelector('[data-action="back-to-desktop"]');
      if (backBtn) {
        backBtn.addEventListener('click', () => this.router.navigate('/'));
      }

      const reloadBtn = this.pageContainer.querySelector('[data-action="reload"]');
      if (reloadBtn) {
        reloadBtn.addEventListener('click', () => window.location.reload());
      }

      const bleedBtn = this.pageContainer.querySelector('[data-action="toggle-bleed"]');
      if (bleedBtn) {
        bleedBtn.addEventListener('click', () => {
          document.body.classList.toggle('viewport-test--bleed');
          bleedBtn.textContent = document.body.classList.contains('viewport-test--bleed')
            ? 'Bleed: ON'
            : 'Bleed: OFF';
          updateMetrics();
        });
      }

      const updateMetrics = () => {
        const vv = window.visualViewport;
        const vvHeight = vv ? Math.round(vv.height) : 0;
        const vvWidth = vv ? Math.round(vv.width) : 0;
        const vvTop = vv ? Math.round(vv.offsetTop) : 0;
        const vvLeft = vv ? Math.round(vv.offsetLeft) : 0;
        const safeBottomCalc = vv ? Math.max(0, Math.round(screen.height - vvHeight - vvTop)) : 0;
        const safeRightCalc = vv ? Math.max(0, Math.round(screen.width - vvWidth - vvLeft)) : 0;
        const docEl = document.documentElement;
        const body = document.body;
        const pageContainer = this.pageContainer;
        const desktopCanvas = this.desktopCanvasEl;
        const workspace = document.querySelector('.workspace-container');

        document.body.style.setProperty('--vv-top', `${vvTop}px`);
        document.body.style.setProperty('--vv-bottom', `${safeBottomCalc}px`);
        document.body.style.setProperty('--vv-left', `${vvLeft}px`);
        document.body.style.setProperty('--vv-right', `${safeRightCalc}px`);
        document.body.style.setProperty('--vv-scale', vv ? String(vv.scale || 1) : '1');

        const metrics = {
          inner: `${window.innerWidth}x${window.innerHeight}`,
          doc: `${docEl.clientWidth}x${docEl.clientHeight}`,
          body: `${body.clientWidth}x${body.clientHeight}`,
          screen: `${screen.width}x${screen.height}`,
          visual: vv ? `${vvWidth}x${vvHeight}` : 'n/a',
          vvTop: vv ? `${vvTop}px` : 'n/a',
          vvBottom: vv ? `${safeBottomCalc}px` : 'n/a',
          vvLeft: vv ? `${vvLeft}px` : 'n/a',
          vvRight: vv ? `${safeRightCalc}px` : 'n/a',
          vvScale: vv ? String(vv.scale || 1) : 'n/a',
          safeTop: getComputedStyle(document.body).getPropertyValue('--safe-top').trim() || '0px',
          safeBottom: getComputedStyle(document.body).getPropertyValue('--safe-bottom').trim() || '0px',
          bleed: document.body.classList.contains('viewport-test--bleed') ? 'ON' : 'OFF'
        };

        Object.entries(metrics).forEach(([key, value]) => {
          const el = this.pageContainer.querySelector(`[data-metric="${key}"]`);
          if (el) el.textContent = value;
        });

        const logLines = [
          `time: ${new Date().toISOString()}`,
          `ua: ${navigator.userAgent}`,
          `devicePixelRatio: ${window.devicePixelRatio}`,
          `screen: ${screen.width}x${screen.height}`,
          `inner: ${window.innerWidth}x${window.innerHeight}`,
          `documentElement: ${docEl.clientWidth}x${docEl.clientHeight}`,
          `body: ${body.clientWidth}x${body.clientHeight}`,
          `visualViewport: ${vv ? `${vvWidth}x${vvHeight}` : 'n/a'}`,
          `visualViewport.scale: ${vv ? vv.scale : 'n/a'}`,
          `visualViewport.offsetTop: ${vv ? vvTop : 'n/a'}`,
          `visualViewport.offsetBottom: ${vv ? safeBottomCalc : 'n/a'}`,
          `visualViewport.offsetLeft: ${vv ? vvLeft : 'n/a'}`,
          `visualViewport.offsetRight: ${vv ? safeRightCalc : 'n/a'}`,
          `safe-area top: ${metrics.safeTop}`,
          `safe-area bottom: ${metrics.safeBottom}`,
          `bleed: ${metrics.bleed}`,
          `scrollY: ${window.scrollY}`,
          `body.scrollHeight: ${body.scrollHeight}`,
          `body.clientHeight: ${body.clientHeight}`,
          `doc.scrollHeight: ${docEl.scrollHeight}`,
          `doc.clientHeight: ${docEl.clientHeight}`,
          `page-container: ${pageContainer ? `${pageContainer.clientWidth}x${pageContainer.clientHeight}` : 'n/a'}`,
          `desktop-canvas: ${desktopCanvas ? `${desktopCanvas.clientWidth}x${desktopCanvas.clientHeight}` : 'n/a'}`,
          `workspace: ${workspace ? `${workspace.clientWidth}x${workspace.clientHeight}` : 'n/a'}`
        ];

        const logEl = this.pageContainer.querySelector('[data-metric="log"]');
        if (logEl) {
          logEl.textContent = logLines.join('\n');
        }
      };

      updateMetrics();
      setTimeout(updateMetrics, 100);
      setTimeout(updateMetrics, 400);
      window.addEventListener('resize', updateMetrics);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateMetrics);
      }

      this.viewportTestCleanup = () => {
        window.removeEventListener('resize', updateMetrics);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updateMetrics);
        }
        document.body.classList.remove('viewport-test');
        document.documentElement.classList.remove('viewport-test');
      };

      this.eventBus?.emit('page:shown', { type: 'viewport-test' });
    } catch (error) {
      console.error('Failed to show viewport test page:', error);
      this.showErrorPage(error.message);
    }
  }

  renderViewportTestPage() {
    return `
      <div class="page-wrapper viewport-test">
        <div class="viewport-test__edge viewport-test__edge--top"></div>
        <div class="viewport-test__edge viewport-test__edge--bottom"></div>
        <div class="viewport-test__corner viewport-test__corner--tl"></div>
        <div class="viewport-test__corner viewport-test__corner--tr"></div>
        <div class="viewport-test__corner viewport-test__corner--bl"></div>
        <div class="viewport-test__corner viewport-test__corner--br"></div>

        <div class="viewport-test__content">
          <h1 class="viewport-test__title">Viewport Test</h1>
          <p class="viewport-test__subtitle">Minimal layer to check safe-area and real viewport size.</p>

          <div class="viewport-test__metrics">
            <div class="viewport-test__metric"><span>window.inner</span><span data-metric="inner">-</span></div>
            <div class="viewport-test__metric"><span>documentElement</span><span data-metric="doc">-</span></div>
            <div class="viewport-test__metric"><span>body</span><span data-metric="body">-</span></div>
            <div class="viewport-test__metric"><span>screen</span><span data-metric="screen">-</span></div>
            <div class="viewport-test__metric"><span>visualViewport</span><span data-metric="visual">-</span></div>
            <div class="viewport-test__metric"><span>vv.offsetTop</span><span data-metric="vvTop">-</span></div>
            <div class="viewport-test__metric"><span>vv.offsetBottom</span><span data-metric="vvBottom">-</span></div>
            <div class="viewport-test__metric"><span>vv.offsetLeft</span><span data-metric="vvLeft">-</span></div>
            <div class="viewport-test__metric"><span>vv.offsetRight</span><span data-metric="vvRight">-</span></div>
            <div class="viewport-test__metric"><span>vv.scale</span><span data-metric="vvScale">-</span></div>
            <div class="viewport-test__metric"><span>safe-top</span><span data-metric="safeTop">-</span></div>
            <div class="viewport-test__metric"><span>safe-bottom</span><span data-metric="safeBottom">-</span></div>
            <div class="viewport-test__metric"><span>bleed</span><span data-metric="bleed">-</span></div>
          </div>

          <div class="viewport-test__actions">
            <button class="viewport-test__button" data-action="back-to-desktop">Back</button>
            <button class="viewport-test__button" data-action="reload">Reload</button>
            <button class="viewport-test__button" data-action="toggle-bleed">Bleed: OFF</button>
          </div>

          <div class="viewport-test__log-label">Copyable log</div>
          <pre class="viewport-test__log" data-metric="log">-</pre>
        </div>
      </div>
    `;
  }

  cleanupViewportTest() {
    if (this.viewportTestCleanup) {
      this.viewportTestCleanup();
      this.viewportTestCleanup = null;
    }
    document.body.classList.remove('viewport-test');
    document.documentElement.classList.remove('viewport-test');
  }

  toggleOverlay(show) {
    if (!this.transitionOverlay) return;
    this.transitionOverlay.classList.toggle('page-transition-overlay--active', show);
  }

  async showErrorPage(message) {
    const errorHtml = `
      <div class="page-wrapper">
        <div class="page-error">
          <div class="page-error-icon">!</div>
          <h1 class="page-error-title">Oops!</h1>
          <p class="page-error-message">${this.escapeHtml(message)}</p>
          <button class="page-error-button" data-action="back-to-desktop">Back to Desktop</button>
        </div>
      </div>
    `;

    this.pageContainer.innerHTML = errorHtml;

    const btn = this.pageContainer.querySelector('[data-action="back-to-desktop"]');
    if (btn) {
      btn.addEventListener('click', () => this.router.navigate('/'));
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  isInPageMode() {
    return this.isPageMode;
  }

  setPageMode(isOn) {
    document.body.classList.toggle('page-mode', isOn);
    document.documentElement.classList.toggle('page-mode', isOn);
    const pageBg = isOn ? '#101010' : '#8A547D';
    document.documentElement.style.setProperty('--page-bg', pageBg);
    this.setThemeColor(pageBg);
  }

  setThemeColor(color) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }

  hideDesktopCanvas() {
    if (!this.desktopCanvasEl) return;
    this.desktopCanvasEl.style.display = 'none';
    this.desktopCanvasEl.style.opacity = '0';
  }
}
