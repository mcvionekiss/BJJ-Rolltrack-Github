from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin

class GymOwner(AbstractUser, PermissionsMixin):
    """
    Custom user model that extends Django's AbstractUser
    The AbstractUser already includes email, first_name, last_name, and password
    """
    class Meta:
        db_table = "gym_owner"

    def __str__(self):
        return f"{self.username} ({self.email})"


class Gym(models.Model):
    """
    Model representing a Gym
    """
    gym_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = "gym"

    def __str__(self):
        return self.name


class GymOwnersGym(models.Model):  # ✅ Fixed inheritance
    """
    Junction table for many-to-many relationship between GymOwner and Gym
    """
    owner = models.ForeignKey(GymOwner, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_owners_gym"
        unique_together = ("owner", "gym")  # Prevents duplicate relationships

    def __str__(self):
        return f"{self.owner.username} - {self.gym.name}"
    
class Student(models.Model):
    """
    Model representing students who check into classes.
    """
    studentID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    class Meta:
        db_table = "student"  
        managed = False  

    def __str__(self):
        return f"{self.name} ({self.email})"
    
class Class(models.Model):
    """
    Model representing a class.
    """
    classID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    startTime = models.TimeField()
    endTime = models.TimeField()
    recurring = models.BooleanField(default=False)  # True if it's a weekly class
    # date = models.DateField(null=True, blank=True)  # Only used for one-time classes
    # gym = models.ForeignKey("Gym", on_delete=models.CASCADE, related_name="classes", null=True, blank=True)

    class Meta:
        db_table = "class"

    def __str__(self):
        return f"{self.name} ({self.startTime} - {self.endTime})"

class Checkin(models.Model):
    """
    Tracks student check-ins for classes.
    """
    checkinID = models.AutoField(primary_key=True)
    student = models.ForeignKey("Student", on_delete=models.CASCADE, db_column="studentID")
    class_instance = models.ForeignKey("Class", on_delete=models.CASCADE, db_column="classID", related_name="checkins")
    checkinTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "checkin"

    def __str__(self):
        return f"{self.student.name} checked into {self.class_instance.name} on {self.checkinTime}"