from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin

from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin

class GymOwner(AbstractUser, PermissionsMixin):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='gymowner_groups',
        blank=True,
        help_text='The groups this gym owner belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='gymowner_permissions',
        blank=True,
        help_text='Specific permissions for this gym owner.',
        verbose_name='user permissions',
    )

    class Meta:
        db_table = "gym_owner"

    def __str__(self):
        return f"{self.username} ({self.email})"
    
class Gym(models.Model):
    gym_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    alternate_name = models.CharField(max_length=100, blank=True)
    owner = models.ManyToManyField(
        GymOwner,
        through='GymOwnersGym',
        related_name='gyms_owned'
    )
    email = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)

    class Meta:
        db_table = "gym"

    def __str__(self):
        return self.name


class Roles(models.Model):
    roleID = models.AutoField(primary_key=True)
    role = models.CharField(max_length=100)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return f"{self.role}"
    
class Belts(models.Model):
    name = models.CharField(max_length=100)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="belts")

    class Meta:
        db_table = "belts"

    def __str__(self):
        return self.name


class Users(AbstractUser, PermissionsMixin):
    phone_number = models.CharField(max_length=20, blank=True)
    role = models.ForeignKey(Roles, on_delete=models.CASCADE)
    belt = models.ForeignKey(Belts, on_delete=models.SET_NULL, null=True, blank=True)
    date_enrolled = models.DateField()
    date_of_birth = models.DateField(blank=True, null=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='users_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='users_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        db_table = "users"


class GymOwnersGym(models.Model):
    owner = models.ForeignKey(GymOwner, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_owners_gym"
        unique_together = ("owner", "gym")

    def __str__(self):
        return f"{self.owner.username} - {self.gym.name}"


class Student(models.Model):
    studentID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    class Meta:
        db_table = "student"

    def __str__(self):
        return f"{self.name} ({self.email})"


class ClassLevel(models.Model):
    levelID = models.AutoField(primary_key=True)
    level = models.CharField(max_length=100)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="class_levels")

    class Meta:
        db_table = "class_level"

    def __str__(self):
        return self.level


class Class(models.Model):
    classID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    startTime = models.TimeField()
    endTime = models.TimeField()
    recurring = models.BooleanField(default=False)
    difficulty = models.ForeignKey(ClassLevel, on_delete=models.CASCADE)
    instructor = models.ManyToManyField(Users, related_name="class_instructors")
    date = models.DateField(null=True, blank=True)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)
    attendance = models.ManyToManyField(Users, related_name="class_attendance")

    class Meta:
        db_table = "class"

    def __str__(self):
        return f"{self.name} ({self.startTime} - {self.endTime})"


class RepeatingClasses(models.Model):
    repeatableID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    startTime = models.TimeField()
    endTime = models.TimeField()
    difficulty = models.ForeignKey(ClassLevel, on_delete=models.CASCADE)

    class Meta:
        db_table = "repeating_class"

    def __str__(self):
        return self.name


class Checkin(models.Model):
    checkinID = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, db_column="studentID")
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE, db_column="classID", related_name="checkins")
    checkinTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "checkin"

    def __str__(self):
        return f"{self.student.name} checked into {self.class_instance.name} on {self.checkinTime}"


class GymAddress(models.Model):
    addressID = models.AutoField(primary_key=True)
    street1 = models.CharField(max_length=100)
    street2 = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_address"


class GymHours(models.Model):
    hoursID = models.AutoField(primary_key=True)
    day = models.IntegerField()
    open_time = models.CharField(max_length=10, blank=True)
    close_time = models.CharField(max_length=10, blank=True)
    closed = models.BooleanField()
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_hours"


class EmergencyContact(models.Model):
    contactID = models.AutoField(primary_key=True)
    student = models.ForeignKey(Users, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20)

    class Meta:
        db_table = "emergency_contact"


class FamilyMembers(models.Model):
    familyID = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student = models.ForeignKey(Users, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "family_members"


class InstructorAvailability(models.Model):
    availabilityID = models.AutoField(primary_key=True)
    day = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    private_lesson = models.BooleanField(blank=True)
    instructor = models.ForeignKey(Users, on_delete=models.CASCADE)

    class Meta:
        db_table = "instructor_availability"

    def __str__(self):
        return f"{self.instructor.username} available on {self.day}"


class ClassAttendance(models.Model):
    id = models.BigAutoField(primary_key=True)
    check_in_time = models.DateTimeField(auto_now_add=True)
    checked_in_by = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True, related_name='checked_in_attendances')
    user = models.ForeignKey(Users, models.DO_NOTHING, related_name='attendances')
    scheduled_class = models.ForeignKey(Class, models.DO_NOTHING)

    class Meta:
        db_table = 'custom_class_attendance'
        unique_together = (('user', 'scheduled_class'),)

    def __str__(self):
        return f"{self.user.email} checked into {self.scheduled_class.name} on {self.check_in_time}"


class GoogleTestUser(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    def __str__(self):
        return self.email