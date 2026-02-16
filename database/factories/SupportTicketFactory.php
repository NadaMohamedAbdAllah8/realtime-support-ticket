<?php

namespace Database\Factories;

use App\Enum\SupportTicketStatus;
use App\Models\Admin;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SupportTicket>
 */

class SupportTicketFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_name' => $this->faker->name(),
            'subject' => $this->faker->sentence(4),
            'message' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(array_column(SupportTicketStatus::cases(), 'value')),
            'assigned_admin_id' => Admin::factory(),
            'admin_response' => $this->faker->optional(0.4)->paragraph(),
        ];
    }

    public function unassigned(): static
    {
        return $this->state(fn() => [
            'assigned_admin_id' => null,
            'status' => SupportTicketStatus::NEW->value,
            'admin_response' => null,
        ]);
    }

    public function answered(): static
    {
        return $this->state(fn() => [
            'status' => SupportTicketStatus::CLOSED->value,
            'admin_response' => $this->faker->paragraph(),
        ]);
    }
}
