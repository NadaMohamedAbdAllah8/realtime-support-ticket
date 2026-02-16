<?php

namespace App\Models;

use App\Enum\SupportTicketStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicket extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'customer_name',
        'subject',
        'message',
        'status',
        'assigned_admin_id',
        'admin_response',
    ];

    protected function casts(): array
    {
        return [
            'status' => SupportTicketStatus::class,
        ];
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'assigned_admin_id');
    }
}
