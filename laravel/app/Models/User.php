<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'username',
        'employee_code',
        'mobile',
        'password',
        'mobile_verification_code',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'mobile_verification_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'mobile_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = ['roles_list', 'permissions_list'];

    public function getRolesListAttribute(): array
    {
        return $this->getRoleNames()->toArray();
    }

    public function getPermissionsListAttribute(): array
    {
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    public function scopeRole(Builder $query, string $role): Builder
    {
        return $query->role($role);
    }
}
