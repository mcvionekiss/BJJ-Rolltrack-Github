FROM python:3.12-slim

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev build-essential pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Show pip version and verbose installation
RUN pip --version && \
    pip install --no-cache-dir -v -r requirements.txt

# Copy the entire project
COPY /backend .

# Debug: List contents of the current directory
RUN ls -R

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]