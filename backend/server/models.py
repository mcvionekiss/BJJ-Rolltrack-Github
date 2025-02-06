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