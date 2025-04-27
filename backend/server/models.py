from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

# """
# class GymOwner(AbstractUser, PermissionsMixin):
#     #Custom user model that extends Django's AbstractUser
#     #The AbstractUser already includes email, first_name, last_name, and password
#     class Meta:
#         db_table = "gym_owner"

#     def __str__(self):
#         return f"{self.username} ({self.email})"
# """


class Roles(models.Model):
    """
    Model representing user roles
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return f"{self.name}"

class Belts(models.Model):
    """
    Belts for martial arts gyms
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=100)
    rank = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "belts"

    def __str__(self):
        return self.name

class Users(AbstractUser, PermissionsMixin):
    """
    Model represent user
    Custom user model that extends Django's AbstractUser
    The AbstractUser already includes email, first_name, last_name, and password
    """
    role_id = models.ForeignKey(Roles, on_delete=models.CASCADE, db_column='role_id')
    date_enrolled = models.DateField()
    date_of_birth = models.DateField(blank = True)
    belt_id = models.ForeignKey(Belts, on_delete=models.CASCADE, blank = True, db_column='belt_id')
    phone_number = models.CharField(max_length=20)
    is_gym_owner = models.BooleanField(default=False)
    is_instructor = models.BooleanField(default=False)

    class Meta:
        db_table = "users"

class Gym(models.Model):
    """
    Model representing a Gym
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    alternate_name = models.CharField(max_length=100, blank=True)
    email = models.CharField(max_length=254)
    phone_number = models.CharField(max_length=20)
    website = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    #include arrribute for pdf wavier 
    # Not including the belts field as it doesn't appear in the database schema

    class Meta:
        db_table = "gyms"

    def __str__(self):
        return self.name


# """
# class GymOwnersGym(models.Model):  # ✅ Fixed inheritance
#     """
#     #Junction table for many-to-many relationship between GymOwner and Gym
#     """
#     owner = models.ForeignKey(GymOwner, on_delete=models.CASCADE)
#     gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

#     class Meta:
#         db_table = "gym_owners_gym"
#         unique_together = ("owner", "gym")  # Prevents duplicate relationships

#     def __str__(self):
#         return f"{self.owner.username} - {self.gym.name}"
# """

# """
# class Student(models.Model):
#     """
#     #    Model representing students who check into classes.
#     """
#     studentID = models.AutoField(primary_key=True)
#     name = models.CharField(max_length=100)
#     email = models.EmailField(unique=True)
#     belt = models.ForeignKey(Belts, on_delete=models.CASCADE)

#     class Meta:
#         db_table = "student"
#         managed = False

#     def __str__(self):
#         return f"{self.name} ({self.email})"
# """

class ClassLevel(models.Model):
    """
    Model Representing the different difficulties a class can have
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    minimum_belt = models.ForeignKey(Belts, models.DO_NOTHING, blank=True, null=True)
    gym = models.ForeignKey(Gym, models.DO_NOTHING)

    class Meta:
        db_table = "class_levels"
        unique_together = (('name', 'gym'),)

class ClassTemplates(models.Model):
    """
    Model representing a template for classes
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    duration_minutes = models.PositiveIntegerField()
    max_capacity = models.PositiveIntegerField(blank=True, null=True)
    level = models.ForeignKey(ClassLevel, on_delete=models.DO_NOTHING)
    gym = models.ForeignKey(Gym, on_delete=models.DO_NOTHING)

    class Meta:
        db_table = 'class_templates'

    def __str__(self):
        return f"{self.name} ({self.level.name if hasattr(self, 'level') else 'All Levels'})"

class Class(models.Model):
    """
    Model representing a scheduled class.
    """
    id = models.BigAutoField(primary_key=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_canceled = models.IntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    template = models.ForeignKey('ClassTemplates', on_delete=models.DO_NOTHING)

    class Meta:
        db_table = "scheduled_classes"

    def __str__(self):
        return f"{self.template.name if hasattr(self, 'template') else 'Class'} on {self.date} ({self.start_time} - {self.end_time})"

class RepeatingClasses(models.Model):
    """
    Repeatable classes
    """
    repeatableID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    startTime = models.TimeField()
    endTime = models.TimeField()
    difficulty = models.ForeignKey(ClassLevel, on_delete=models.CASCADE)
    instructor = models.ManyToManyField(Users, related_name="repeating_classes_teaching")
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="repeating_classes")

    class Meta:
        db_table = "repeating_class"
        
    def __str__(self):
        return f"{self.name} ({self.startTime} - {self.endTime})"

# """

# class Checkin(models.Model):
#     """
#     #Tracks student check-ins for classes.
#     """
#     checkinID = models.AutoField(primary_key=True)
#     student = models.ForeignKey("Student", on_delete=models.CASCADE, db_column="studentID")
#     class_instance = models.ForeignKey("Class", on_delete=models.CASCADE, db_column="classID", related_name="checkins")
#     checkinTime = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "checkin"

#     def __str__(self):
#         return f"{self.student.name} checked into {self.class_instance.name} on {self.checkinTime}"
# """

class GymAddress(models.Model):
    """
    Model representing a Gym Address
    """
    addressID = models.AutoField(primary_key=True)
    street1 = models.CharField(max_length=100)
    street2 = models.CharField(max_length=100, blank = True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zipcode = models.IntegerField()
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_addresses"

class GymHours(models.Model):
    """
    Model representing Gym Hours
    """
    hoursID = models.AutoField(primary_key=True)
    day = models.IntegerField()
    open_time = models.TimeField(null=True)
    close_time = models.TimeField(null=True)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_hours"

class EmergencyContact(models.Model):
    """
    Model representing emergency contact for students
    """
    contactID = models.AutoField(primary_key=True)
    student = models.ForeignKey(Users, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=100, blank = True)
    phone_number = models.CharField(max_length=20)

    class Meta:
        db_table = "emergency_contacts"

class FamilyMembers(models.Model):
    """
    Model representing additional members an account could have
    """
    familyID = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student = models.ForeignKey(Users, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "family_members"

class InstructorAvailability(models.Model):
    """
    Model representing an instructors availability
    """
    familyID = models.AutoField(primary_key=True)
    day = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    private_lesson = models.BooleanField(blank = True)
    instructor = models.ForeignKey(Users, on_delete = models.CASCADE)

class ClassAttendance(models.Model):
    """
    Model for tracking student attendance at classes
    """
    id = models.BigAutoField(primary_key=True)
    check_in_time = models.DateTimeField(auto_now_add=True)
    checked_in_by = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True, related_name='checked_in_attendances')
    user = models.ForeignKey(Users, models.DO_NOTHING, related_name='attendances')
    scheduled_class = models.ForeignKey(Class, models.DO_NOTHING)

    class Meta:
        db_table = 'class_attendance'
        unique_together = (('user', 'scheduled_class'),)
        
    def __str__(self):
        return f"{self.user.email} checked into {self.scheduled_class.template.name if hasattr(self.scheduled_class, 'template') else 'Class'} on {self.scheduled_class.date}"
 
class PasswordResetToken(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at
