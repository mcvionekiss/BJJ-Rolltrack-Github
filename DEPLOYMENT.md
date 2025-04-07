# BJJ RollTrack Deployment Guide

This guide provides instructions for deploying the BJJ RollTrack application to Amazon EC2 in different environments (development, staging, production).

## Prerequisites

- AWS Account with EC2 access
- Domain name (for production and staging)
- SSL certificates (for HTTPS)
- Docker and Docker Compose installed on the EC2 instance

## Environment Setup

The application supports three environments:

- **Development**: For local development
- **Staging**: For testing before production
- **Production**: For the live application

Each environment has its own configuration file:

- `.env.development`
- `.env.staging`
- `.env.production`

## Deployment Steps

### 1. Prepare the EC2 Instance

1. Launch an EC2 instance with Amazon Linux 2 or Ubuntu
2. Install Docker and Docker Compose:

```bash
# For Amazon Linux 2
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# For Ubuntu
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu
```

3. Clone the repository:

```bash
git clone https://github.com/your-username/BJJ-Rolltrack-Github.git
cd BJJ-Rolltrack-Github
```

### 2. Configure Environment Variables

1. Copy the appropriate environment file:

```bash
# For production
cp .env.production .env

# For staging
cp .env.staging .env

# For development
cp .env.development .env
```

2. Edit the `.env` file to set your specific configuration:
   - Update domain names
   - Set secure passwords and secret keys
   - Configure database connection details

### 3. SSL Certificate Setup (for Production/Staging)

For HTTPS support, you need SSL certificates. You can use Let's Encrypt:

1. Install Certbot:

```bash
# For Amazon Linux 2
sudo amazon-linux-extras install epel
sudo yum install -y certbot

# For Ubuntu
sudo apt install -y certbot
```

2. Obtain certificates:

```bash
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

3. Copy certificates to the nginx/ssl directory:

```bash
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R $(whoami) nginx/ssl
```

### 4. Deploy with Docker Compose

1. Build and start the containers:

```bash
docker-compose up -d --build
```

2. Verify the deployment:

```bash
docker-compose ps
```

### 5. Domain Configuration

1. Configure your domain's DNS to point to your EC2 instance's public IP
2. For production, set up A records for:
   - your-domain.com
   - www.your-domain.com
3. For staging, set up an A record for:
   - staging.your-domain.com

### 6. Redundancy and High Availability

The application is configured for redundancy with multiple backend instances. To further enhance availability:

1. Set up an Auto Scaling Group for your EC2 instances
2. Use an Elastic Load Balancer to distribute traffic
3. Configure health checks to automatically replace failed instances

### 7. Monitoring and Maintenance

1. Set up CloudWatch for monitoring:

```bash
# Install CloudWatch agent
sudo amazon-linux-extras install -y amazon-cloudwatch-agent
```

2. Configure log forwarding to CloudWatch
3. Set up alarms for high CPU usage, memory usage, etc.

### 8. Backup Strategy

1. Set up automated database backups:
   - RDS automated backups
   - Manual snapshots before major updates

2. Set up application data backups:
   - Use AWS Backup or a custom script to back up volumes

## Environment-Specific Configurations

### Production

- Multiple backend replicas for redundancy
- HTTPS enabled
- Debug mode disabled
- Optimized for performance

### Staging

- Single backend replica
- HTTPS enabled
- Debug mode disabled
- Separate database from production

### Development

- Single backend replica
- HTTPS disabled
- Debug mode enabled
- Hot reloading enabled

## Troubleshooting

### Common Issues

1. **Container fails to start**:
   - Check logs: `docker-compose logs`
   - Verify environment variables

2. **Database connection issues**:
   - Check RDS security group settings
   - Verify database credentials

3. **HTTPS not working**:
   - Check SSL certificate paths
   - Verify Nginx configuration

## Updating the Application

To update the application:

```bash
# Pull the latest changes
git pull

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build
```

## Rollback Procedure

If an update causes issues:

```bash
# Revert to the previous commit
git checkout <previous-commit-hash>

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build