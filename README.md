# RollTrack (In development)
 This application is a simple, modern application for martial artist gym owners to quickly manage student check-ins, add or modify classes, and view analytics to effectively structure their day-to-day operations.

**Note: This application only works locally at the momemt.**

## How to Run
Make sure you have DJango and React installed in order to run this application.

### Step 1: Setting up the Backend
In your terminal, switch into the backend directory using `cd backend/` and run `python manage.py runserver`.

### Step 2: Setting up the Frontend
In a new terminal window, switch into the frontend directory using `cd frontend/`. Install all the dependencies by running `npm install`. After that is finished, run `npm start`. This should automatically bring up the login page for RollTrack.

### Step 3: Login or Signup

#### Signing Up
Click on the Signup button to be redirected to the Signup Page.

#### Logging In
Try logging in using the example profile:

``` 
User: new@new.com
Password: new
```

This should take you to the dashboard.

# Running Docker

1) Stop all containers
```
docker-compose down
```

2) Remove all cached images
```
docker system prune -a
```

3) Remove all volumes
```
docker volume prune
```

4) Force rebuild without cache
```
docker-compose build --no-cache
```