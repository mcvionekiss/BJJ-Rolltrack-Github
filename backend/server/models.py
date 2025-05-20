from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid
import os
from django.core.files.storage import FileSystemStorage
from django.dispatch import receiver

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
    has_waiver= models.BooleanField(default=False)

    class Meta:
        db_table = "gyms"

    def __str__(self):
        return self.name

class GymsOwners(models.Model):
    """
    Junction table for many-to-many relationship between Users and Gym
    """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gyms_owners"
        unique_together = ("user", "gym")

    def __str__(self):
        return f"{self.user.username} - {self.gym.name}"

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
    color = models.CharField(max_length=10, default="#3788d8")
    #minimum_belt = models.ForeignKey(Belts, models.DO_NOTHING, blank=True, null=True)
    #gym = models.ForeignKey(Gym, models.DO_NOTHING)

    class Meta:
        db_table = "class_levels"

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

class Checkin(models.Model):
    """
    Model for tracking student check-ins for classes.
    """
    checkinID = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='checkins')
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="checkins")
    gym = models.ForeignKey(Gym, on_delete=models.DO_NOTHING, null=True)
    checkinTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "checkin"
        unique_together = (('user', 'class_instance'),)

    def __str__(self):
        return f"{self.user.email} checked into {self.class_instance.template.name if hasattr(self.class_instance, 'template') else 'Class'} on {self.checkinTime}"

class GymAddress(models.Model):
    """
    Model representing a Gym Address
    """
    id = models.AutoField(primary_key=True)
    street_line1 = models.CharField(max_length=100)
    street_line2 = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "gym_addresses"

class GymHours(models.Model):
    """
    Model representing Gym Hours
    """
    id = models.AutoField(primary_key=True)
    day_of_week = models.IntegerField()
    open_time = models.TimeField(null=True)
    close_time = models.TimeField(null=True)
    is_closed = models.BooleanField(default=False)
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
    gym = models.ForeignKey(Gym, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        db_table = 'class_attendance'
        unique_together = (('user', 'scheduled_class'),)

    def __str__(self):
        return f"{self.user.email} checked into {self.scheduled_class.template.name if hasattr(self.scheduled_class, 'template') else 'Class'} on {self.scheduled_class.date}"

def waiver_upload_path(instance, filename):
    """Determine file path for waiver uploads"""
    # Format: waivers/gym_id/waiver_id_timestamp.pdf
    return f'waivers/{instance.gym.id}/{instance.id}_{timezone.now().strftime("%Y%m%d%H%M%S")}.pdf'

class GymWaiver(models.Model):
    """
    Model for storing gym waiver templates (PDF files)
    """
    WAIVER_TYPE_CHOICES = [
        ('default', 'Default Template'),
        ('custom', 'Custom Upload'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='waivers')
    waiver_type = models.CharField(max_length=10, choices=WAIVER_TYPE_CHOICES, default='default')
    waiver_file = models.FileField(upload_to=waiver_upload_path, null=True, blank=True)
    custom_name = models.CharField(max_length=100, blank=True)
    gym_name_in_waiver = models.CharField(max_length=100, blank=True)
    address_in_waiver = models.CharField(max_length=255, blank=True)
    state_in_waiver = models.CharField(max_length=100, blank=True)
    waiver_text = models.TextField(blank=True)  # Store template text for default waivers
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'gym_waivers'
        indexes = [
            models.Index(fields=['gym', 'is_active']),
        ]
    
    def __str__(self):
        return f"Waiver for {self.gym.name} ({self.get_waiver_type_display()})"
    
    def save(self, *args, **kwargs):
        # Set the gym has_waiver flag to True when a waiver is created
        if not self.pk:  # New waiver being created
            self.gym.has_waiver = True
            self.gym.save()
        super().save(*args, **kwargs)

class MemberWaiverSignature(models.Model):
    """
    Model for tracking member signatures on gym waivers
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('signed', 'Signed'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='waiver_signatures')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='member_signatures')
    waiver = models.ForeignKey(GymWaiver, on_delete=models.PROTECT, related_name='signatures')
    signature_data = models.TextField()  # Store signature as base64 image data
    signed_waiver_file = models.FileField(upload_to='signed_waivers/%Y/%m/', null=True, blank=True)  # Store the signed waiver PDF
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'member_waiver_signatures'
        unique_together = (('user', 'gym', 'waiver'),)
        indexes = [
            models.Index(fields=['user', 'gym']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.gym.name} Waiver ({self.status})"
    
    def mark_as_signed(self, signature_data, ip_address=None, user_agent=None):
        """Mark the waiver as signed with signature data and metadata"""
        self.signature_data = signature_data
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.signed_at = timezone.now()
        self.status = 'signed'
        self.save()
    
    def send_confirmation_email(self):
        """Send confirmation email to gym owner and update status"""
        # This will be implemented with Zoho email API
        if self.status == 'signed' and not self.email_sent:
            # Logic to send email via Zoho API
            self.email_sent = True
            self.email_sent_at = timezone.now()
            self.save()
            return True
        return False

# Signal to handle deleting waiver files when a waiver record is deleted
@receiver(models.signals.post_delete, sender=GymWaiver)
def auto_delete_waiver_file_on_delete(sender, instance, **kwargs):
    """
    Delete the waiver file when the GymWaiver instance is deleted
    """
    if instance.waiver_file:
        if os.path.isfile(instance.waiver_file.path):
            os.remove(instance.waiver_file.path)

# Signal to handle deleting old waiver files when a waiver is updated
@receiver(models.signals.pre_save, sender=GymWaiver)
def auto_delete_waiver_file_on_change(sender, instance, **kwargs):
    """
    Delete the old waiver file when the waiver file is updated
    """
    if not instance.pk:
        return False
    
    try:
        old_waiver = GymWaiver.objects.get(pk=instance.pk)
    except GymWaiver.DoesNotExist:
        return False
    
    old_file = old_waiver.waiver_file
    new_file = instance.waiver_file
    
    if old_file and old_file != new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)
 
class PasswordResetToken(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

class GuestVisit(models.Model):
    """
    Model for storing information about guest visits
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    experience_level = models.CharField(max_length=50)
    referral_source = models.CharField(max_length=50)
    first_time_visit = models.BooleanField(default=True)
    marketing_consent = models.BooleanField(default=False)
    other_dojos = models.TextField(blank=True, null=True)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "guest_visits"
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['gym']),
        ]

    def __str__(self):
        return f"{self.name} ({self.email}) at {self.gym.name}"

class GuestCheckin(models.Model):
    """
    Model for tracking guest check-ins to classes
    """
    id = models.BigAutoField(primary_key=True)
    guest = models.ForeignKey(GuestVisit, on_delete=models.CASCADE, related_name='checkins')
    class_instance = models.ForeignKey('Class', on_delete=models.CASCADE, related_name='guest_checkins')
    checkin_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "guest_checkins"
        unique_together = (('guest', 'class_instance'),)

    def __str__(self):
        return f"{self.guest.name} checked into {self.class_instance.template.name if hasattr(self.class_instance, 'template') else 'Class'} on {self.checkin_time}"

class RecurringClass(models.Model):
    """
    Model representing a scheduled class.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_canceled = models.IntegerField(default=0)
    is_recurring = models.BooleanField()
    recurrs_Monday = models.BooleanField()
    recurrs_Tuesday = models.BooleanField()
    recurrs_Wednesday = models.BooleanField()
    recurrs_Thursday = models.BooleanField()
    recurrs_Friday = models.BooleanField()
    recurrs_Saturday = models.BooleanField()
    recurrs_Sunday = models.BooleanField()
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_month_updated = models.IntegerField(null=True)
    duration_minutes = models.PositiveIntegerField(default = 0, null=True)
    max_capacity = models.PositiveIntegerField(blank=True, null=True)
    level = models.ForeignKey(ClassLevel, on_delete=models.DO_NOTHING, null=True)
    template = models.ForeignKey('ClassTemplates', on_delete=models.DO_NOTHING, blank=True, null=True)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "recurring_classes"

    def __str__(self):
        return f"{self.template.name if hasattr(self, 'template') else 'Class'} on {self.date} ({self.start_time} - {self.end_time})"

class TestClass(models.Model):
    """
    Model representing a scheduled class.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_canceled = models.IntegerField(default=0)
    is_recurring = models.BooleanField(default=False)
    duration_minutes = models.PositiveIntegerField(default = 0, null=True)
    max_capacity = models.PositiveIntegerField(blank=True, null=True)
    level = models.ForeignKey(ClassLevel, on_delete=models.DO_NOTHING, null=True)
    parent_recurr_class_id = models.ForeignKey(RecurringClass, on_delete=models.SET_NULL, blank=True, null = True)
    notes = models.TextField(blank=True, null=True)
    template = models.ForeignKey('ClassTemplates', on_delete=models.DO_NOTHING, blank=True, null = True)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)

    class Meta:
        db_table = "classes"

    def __str__(self):
        return f"{self.template.name if hasattr(self, 'template') else 'Class'} on {self.date} ({self.start_time} - {self.end_time})"
