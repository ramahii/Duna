from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, Label, TaskLabel


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'created_at']


class TaskLabelSerializer(serializers.ModelSerializer):
    label = LabelSerializer(read_only=True)
    
    class Meta:
        model = TaskLabel
        fields = ['id', 'label']


class TaskSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    labels = TaskLabelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'description', 'status', 'priority', 'deadline', 'labels', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'deadline']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user