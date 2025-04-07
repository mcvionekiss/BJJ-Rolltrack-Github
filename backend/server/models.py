from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin


"""

class GymOwner(AbstractUser, PermissionsMixin):
"""
#Custom user model that extends Django's AbstractUser
#The AbstractUser already includes email, first_name, last_name, and password
"""
    class Meta:
        db_table = "gym_owner"

    def __str__(self):
        return f"{self.username} ({self.email})"
"""


class Roles(models.Model):
    """
    Model representing user roles
    """
    roleID = models.AutoField(primary_key=True)
    role = models.CharField(max_length=100)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return f"{self.role}"

class Belts(models.Model):
    """
    Belts for martial arts gyms
    """
    beltID = models.AutoField(primary_key=True)
    belt = models.CharField(max_length=100)

    class Meta:
        db_table = "belts"

    def __str__(self):
        return f"{self.belt}"

class Users(AbstractUser, PermissionsMixin):
    """
    Model represent user
    Custom user model that extends Django's AbstractUser
    The AbstractUser already includes email, first_name, last_name, and password
    """
    role = models.ForeignKey(Roles, on_delete=models.CASCADE)
    date_enrolled = models.DateField()
    date_of_birth = models.DateField(blank = True)
    belt = models.ForeignKey(Belts, on_delete=models.CASCADE, blank = True)

    class Meta:
        db_table = "users"

class Gym(models.Model):
    """
    Model representing a Gym
    """
    gym_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    alternate_name = models.CharField(max_length=100, blank = True)
    owner = models.ManyToManyField(Users, related_name="owner_gym")
    email = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    belts = models.ForeignKey(Belts, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym"

    def __str__(self):
        return self.name



"""


class GymOwnersGym(models.Model):  # ✅ Fixed inheritance
"""
#Junction table for many-to-many relationship between GymOwner and Gym
"""
    owner = models.ForeignKey(, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_owners_gym"
        unique_together = ("owner", "gym")  # Prevents duplicate relationships

    def __str__(self):
        return f"{self.owner.username} - {self.gym.name}"

"""


class Student(models.Model):
    """
    Model representing students who check into classes.
    """
    studentID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    belt = models.ForeignKey(Belts, on_delete=models.CASCADE)

    class Meta:
        db_table = "student"
        managed = False

    def __str__(self):
        return f"{self.name} ({self.email})"


class ClassLevel(models.Model):
    """
    Model Representing the different difficulties a class can have
    """
    levelID = models.AutoField(primary_key=True)
    level = models.CharField(max_length=100)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "class_level"

class Class(models.Model):
    """
    Model representing a class.
    """
    classID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    startTime = models.TimeField()
    endTime = models.TimeField()
    recurring = models.BooleanField(default=False)  # True if it's a weekly class
    difficulty = models.ForeignKey(ClassLevel, on_delete=models.CASCADE)
    instructor = models.ManyToManyField(Users, related_name="class_instructors")
    date = models.DateField(null=True, blank=True)
    gym = models.ForeignKey("Gym", on_delete=models.CASCADE)
    attendance = models.ManyToManyField(Users, related_name="class_attendance")

    class Meta:
        db_table = "class"

    def __str__(self):
        return f"{self.name} ({self.startTime} - {self.endTime})"

class RepeatingClasses:
    """
    Repeatable classes
    """
    repeatableID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    startTime = models.TimeField()
    endTime = models.TimeField()
    difficulty = models.ForeignKey(ClassLevel, on_delete=models.CASCADE)

    class Meta:
        db_table = "repeating_class"


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
        db_table = "gym_address"

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
        db_table = "emergency_contact"

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

