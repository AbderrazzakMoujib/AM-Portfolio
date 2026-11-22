<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdmin extends Command
{
    protected $signature = 'app:create-admin';

    protected $description = 'Create a new AM Portfolio administrator';

    public function handle(): int
    {
        $name = trim($this->ask('Admin name'));
        $email = strtolower(trim($this->ask('Admin email')));

        $password = $this->secret('Admin password');
        $confirmation = $this->secret('Confirm password');

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $confirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'confirmed',
                'min:12',
            ],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $admin = new User();

        $admin->name = $name;
        $admin->email = $email;
        $admin->password = Hash::make($password);
        $admin->is_admin = true;

        $admin->save();

        $this->info('Administrator created successfully.');

        return self::SUCCESS;
    }
}
