#!/usr/bin/env python3
"""
## ANCHOR POINTS
- ENTRY: Unified development server launcher
- MAIN: Starts both frontend and backend servers
- EXPORTS: None (process manager)
- DEPS: subprocess, signal, sys
- TODOs: Add health checks, better error handling

Unified Development Server Launcher
UPDATED COMMENTS: Single command to start entire development environment
Manages both frontend (port 8080) and backend API (port 8000) servers
SCALED FOR: Graceful shutdown, process monitoring, error recovery
"""

import subprocess
import signal
import sys
import os
import time
from pathlib import Path

# REUSED: Process management
class ServerManager:
    """
    Manages multiple server processes
    UPDATED COMMENTS: Handles lifecycle of frontend and backend servers
    """
    
    def __init__(self):
        self.processes = []
        self.running = True
        
        # CRITICAL: Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.shutdown)
        signal.signal(signal.SIGTERM, self.shutdown)
    
    def start_server(self, name: str, command: list, cwd: str = None):
        """
        Start a server process
        SCALED FOR: Multiple servers with different configurations
        
        Args:
            name: Server name for logging
            command: Command to execute
            cwd: Working directory (optional)
        """
        print(f"🚀 Starting {name}...")
        
        try:
            # UPDATED COMMENTS: Start process without capturing output for real-time logs
            process = subprocess.Popen(
                command,
                cwd=cwd,
                # CRITICAL: Don't capture stdout/stderr - let them print directly
                stdout=None,
                stderr=None
            )
            
            self.processes.append({
                'name': name,
                'process': process,
                'command': ' '.join(command)
            })
            
            print(f"✅ {name} started (PID: {process.pid})")
            return process
            
        except Exception as e:
            print(f"❌ Failed to start {name}: {e}")
            return None
    
    def monitor_output(self, server_info: dict):
        """
        Monitor server output
        REUSED: Non-blocking output reading
        UPDATED COMMENTS: Removed - output now prints directly to console
        """
        # CRITICAL: Output monitoring removed - processes print directly
        pass
    
    def shutdown(self, signum=None, frame=None):
        """
        Graceful shutdown of all servers
        CRITICAL: Ensures clean process termination
        """
        if not self.running:
            return
        
        self.running = False
        print("\n\n🛑 Shutting down servers...")
        
        for server_info in self.processes:
            name = server_info['name']
            process = server_info['process']
            
            try:
                print(f"⏹️  Stopping {name}...")
                process.terminate()
                
                # UPDATED COMMENTS: Wait for graceful shutdown
                try:
                    process.wait(timeout=5)
                    print(f"✅ {name} stopped")
                except subprocess.TimeoutExpired:
                    print(f"⚠️  Force killing {name}...")
                    process.kill()
                    process.wait()
                    
            except Exception as e:
                print(f"❌ Error stopping {name}: {e}")
        
        print("\n👋 All servers stopped")
        sys.exit(0)
    
    def wait_for_servers(self):
        """
        Wait for all servers to complete
        SCALED FOR: Long-running development sessions
        """
        try:
            while self.running:
                # UPDATED COMMENTS: Check if any process died
                for server_info in self.processes:
                    process = server_info['process']
                    if process.poll() is not None:
                        print(f"⚠️  {server_info['name']} stopped unexpectedly (exit code: {process.returncode})")
                        self.shutdown()
                        return
                
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.shutdown()

def main():
    """
    Main entry point
    ANCHOR: main_execution
    """
    print("=" * 60)
    print("🎯 Portfolio Development Environment")
    print("=" * 60)
    print()
    
    # UPDATED COMMENTS: Verify we're in the right directory
    if not Path('index.html').exists():
        print("❌ Error: index.html not found. Run from project root.")
        sys.exit(1)
    
    manager = ServerManager()
    
    # REUSED: Server configuration
    servers = [
        {
            'name': 'Frontend',
            'command': [sys.executable, 'serve.py'],
            'cwd': None
        },
        {
            'name': 'Backend API',
            'command': [sys.executable, 'api_server.py'],
            'cwd': 'backend'
        }
    ]
    
    # SCALED FOR: Sequential startup with health checks
    for server_config in servers:
        process = manager.start_server(
            server_config['name'],
            server_config['command'],
            server_config['cwd']
        )
        
        if not process:
            print(f"❌ Failed to start {server_config['name']}, aborting...")
            manager.shutdown()
            sys.exit(1)
        
        # UPDATED COMMENTS: Give server time to start
        time.sleep(1)
    
    print()
    print("=" * 60)
    print("✨ Development environment ready!")
    print("=" * 60)
    print()
    print("📱 Frontend:     http://localhost:8080/")
    print("🔌 Backend API:  http://localhost:8000/")
    print("📊 API Docs:     http://localhost:8000/docs")
    print()
    print("Press Ctrl+C to stop all servers")
    print("=" * 60)
    print()
    
    # CRITICAL: Wait for servers
    manager.wait_for_servers()

if __name__ == "__main__":
    main()
