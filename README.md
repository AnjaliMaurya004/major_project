# TaskPro - Personal Task Management App
A modern task management web application built with Django and MySQL. Features JWT authentication, beautiful gradient UI, and complete CRUD operations for tasks.

# Features
User registration and JWT authentication  
Create, edit, delete, and complete tasks  
Search and filter tasks by status and priority  
Dashboard with real-time statistics  
Professional black/grey gradient design  
Fully responsive for all devices

# Prerequisites
Python 3.8+  
MySQL 5.7+  
pip

# Installation

## 1. Clone the repository

bashgit clone https://github.com/yourusername/taskpro.git
cd taskpro

## Create virtual environment
bashpython -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

## 2. Install dependencies

bashpip install -r requirements.txt

## 3.Setup MySQL Database

CREATE DATABASE taskpro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;  
CREATE USER 'taskpro_user'@'localhost' IDENTIFIED BY 'TaskPro@2025';  
GRANT ALL PRIVILEGES ON taskpro_db.* TO 'taskpro_user'@'localhost';  
FLUSH PRIVILEGES;

## 4.Update database settings

Edit taskpro/settings.py and update your MySQL password if different:  
pythonDATABASES = {      
    'default': {  
        'ENGINE': 'django.db.backends.mysql',  
        'NAME': 'taskpro_db',  
        'USER': 'taskpro_user',  
        'PASSWORD': 'TaskPro@2025',  # Change if needed  
        'HOST': 'localhost',  
        'PORT': '3306',  
        }  
    }

## 5. Run migrations

bashpython manage.py makemigrations
python manage.py migrate

## 6.Create superuser (optional)

bashpython manage.py createsuperuser

## 7. Run the server

bashpython manage.py runserver

## 9. Access the application
Homepage: http://127.0.0.1:8000/
Admin Panel: http://127.0.0.1:8000/admin/

# USE:

Register: Create a new account on the registration page
Login: Sign in with your credentials
Dashboard: View all your tasks with statistics
Add Task: Click "Add New Task" button to create a task
Manage: Edit, complete, or delete tasks using action buttons
Filter: Use sidebar and search to filter tasks

# Tech Stack

Backend: Django 4.x, Django REST Framework, JWT Authentication
Database: MySQL
Frontend: HTML5, CSS3, Vanilla JavaScript
Icons: Font Awesome


