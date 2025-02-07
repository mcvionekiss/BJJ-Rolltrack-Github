import pytest
from django.test import Client, TestCase
from django.urls import reverse
from server.models import GymOwner
import json

class TestAuthentication(TestCase):
    def setUp(self):
        """Set up test data before each test"""
        self.client = Client()
        self.login_url = reverse('login')
        self.register_url = reverse('register')
        self.logout_url = reverse('logout')
        
        # Create a test user
        self.test_user = GymOwner.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Test user registration data
        self.valid_register_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'firstName': 'New',
            'lastName': 'User'
        }
        
        # Test login data
        self.valid_login_data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(
            self.register_url,
            data=json.dumps(self.valid_register_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertTrue(GymOwner.objects.filter(email=self.valid_register_data['email']).exists())

    def test_user_registration_duplicate_email(self):
        """Test registration with existing email"""
        # First registration
        self.client.post(
            self.register_url,
            data=json.dumps(self.valid_register_data),
            content_type='application/json'
        )
        
        # Try to register again with same email
        response = self.client.post(
            self.register_url,
            data=json.dumps(self.valid_register_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])
        self.assertIn('Email already registered', response.json()['message'])

    def test_user_login_success(self):
        """Test successful login"""
        response = self.client.post(
            self.login_url,
            data=json.dumps(self.valid_login_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(response.json()['user']['email'], self.valid_login_data['email'])

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        invalid_data = {
            'email': 'test@example.com',
            'password': 'wrongpass'
        }
        
        response = self.client.post(
            self.login_url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertFalse(response.json()['success'])
        self.assertIn('Invalid credentials', response.json()['message'])

    def test_user_login_nonexistent_email(self):
        """Test login with non-existent email"""
        invalid_data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(
            self.login_url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertFalse(response.json()['success'])

    def test_user_logout(self):
        """Test user logout"""
        # First login
        self.client.post(
            self.login_url,
            data=json.dumps(self.valid_login_data),
            content_type='application/json'
        )
        
        # Then logout
        response = self.client.post(self.logout_url)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

    def test_csrf_token_required(self):
        """Test that CSRF token is required for protected routes"""
        # Login first
        self.client.post(
            self.login_url,
            data=json.dumps(self.valid_login_data),
            content_type='application/json'
        )
        
        # Try to logout without CSRF token
        self.client.handler.enforce_csrf_checks = True  # Enable CSRF checks
        response = self.client.post(self.logout_url)
        
        self.assertEqual(response.status_code, 403)  # Should be forbidden without CSRF token