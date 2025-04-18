# Generated by Django 5.1.6 on 2025-04-05 02:47

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('studentID', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
            ],
            options={
                'db_table': 'student',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Belts',
            fields=[
                ('beltID', models.AutoField(primary_key=True, serialize=False)),
                ('belt', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'belts',
            },
        ),
        migrations.CreateModel(
            name='ClassLevel',
            fields=[
                ('levelID', models.AutoField(primary_key=True, serialize=False)),
                ('level', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'class_level',
            },
        ),
        migrations.CreateModel(
            name='Roles',
            fields=[
                ('roleID', models.AutoField(primary_key=True, serialize=False)),
                ('role', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'roles',
            },
        ),
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('date_enrolled', models.DateField()),
                ('date_of_birth', models.DateField(blank=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
                ('belt', models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='server.belts')),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.roles')),
            ],
            options={
                'db_table': 'users',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Class',
            fields=[
                ('classID', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('startTime', models.TimeField()),
                ('endTime', models.TimeField()),
                ('recurring', models.BooleanField(default=False)),
                ('date', models.DateField(blank=True, null=True)),
                ('attendance', models.ManyToManyField(related_name='class_attendance', to=settings.AUTH_USER_MODEL)),
                ('instructor', models.ManyToManyField(related_name='class_instructors', to=settings.AUTH_USER_MODEL)),
                ('difficulty', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.classlevel')),
            ],
            options={
                'db_table': 'class',
            },
        ),
        migrations.CreateModel(
            name='Checkin',
            fields=[
                ('checkinID', models.AutoField(primary_key=True, serialize=False)),
                ('checkinTime', models.DateTimeField(auto_now_add=True)),
                ('student', models.ForeignKey(db_column='studentID', on_delete=django.db.models.deletion.CASCADE, to='server.student')),
                ('class_instance', models.ForeignKey(db_column='classID', on_delete=django.db.models.deletion.CASCADE, related_name='checkins', to='server.class')),
            ],
            options={
                'db_table': 'checkin',
            },
        ),
        migrations.CreateModel(
            name='EmergencyContact',
            fields=[
                ('contactID', models.AutoField(primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('relationship', models.CharField(blank=True, max_length=100)),
                ('phone_number', models.CharField(max_length=20)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'emergency_contact',
            },
        ),
        migrations.CreateModel(
            name='Gym',
            fields=[
                ('gym_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('alternate_name', models.CharField(blank=True, max_length=100)),
                ('email', models.CharField(max_length=100)),
                ('phone_number', models.CharField(max_length=20)),
                ('belts', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.belts')),
                ('owner', models.ManyToManyField(related_name='owner_gym', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'gym',
            },
        ),
        migrations.CreateModel(
            name='FamilyMembers',
            fields=[
                ('familyID', models.AutoField(primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('gym', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.gym')),
            ],
            options={
                'db_table': 'family_members',
            },
        ),
        migrations.AddField(
            model_name='classlevel',
            name='gym',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.gym'),
        ),
        migrations.AddField(
            model_name='class',
            name='gym',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.gym'),
        ),
        migrations.CreateModel(
            name='GymAddress',
            fields=[
                ('addressID', models.AutoField(primary_key=True, serialize=False)),
                ('street1', models.CharField(max_length=100)),
                ('street2', models.CharField(blank=True, max_length=100)),
                ('city', models.CharField(max_length=100)),
                ('state', models.CharField(max_length=100)),
                ('zipcode', models.IntegerField()),
                ('gym', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.gym')),
            ],
            options={
                'db_table': 'gym_address',
            },
        ),
        migrations.CreateModel(
            name='GymHours',
            fields=[
                ('hoursID', models.AutoField(primary_key=True, serialize=False)),
                ('day', models.IntegerField()),
                ('open_time', models.TimeField(null=True)),
                ('close_time', models.TimeField(null=True)),
                ('gym', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.gym')),
            ],
            options={
                'db_table': 'gym_hours',
            },
        ),
        migrations.CreateModel(
            name='InstructorAvailability',
            fields=[
                ('familyID', models.AutoField(primary_key=True, serialize=False)),
                ('day', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('private_lesson', models.BooleanField(blank=True)),
                ('instructor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
