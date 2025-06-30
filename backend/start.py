#!/usr/bin/env python3
"""
Startup script for the RAG Pipeline API
"""
import os
import sys
import subprocess

def main():
    # Ensure we're in the right directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_path = os.path.join(backend_dir, 'venv')
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', 'venv'])
    
    # Determine the correct pip and python paths
    if os.name == 'nt':  # Windows
        pip_path = os.path.join(venv_path, 'Scripts', 'pip')
        python_path = os.path.join(venv_path, 'Scripts', 'python')
    else:  # Unix/Linux/MacOS
        pip_path = os.path.join(venv_path, 'bin', 'pip')
        python_path = os.path.join(venv_path, 'bin', 'python')
    
    # Install requirements
    print("Installing requirements...")
    subprocess.run([pip_path, 'install', '-r', 'requirements.txt'])
    
    # Start the server
    print("Starting RAG Pipeline API server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    subprocess.run([python_path, 'main.py'])

if __name__ == '__main__':
    main()