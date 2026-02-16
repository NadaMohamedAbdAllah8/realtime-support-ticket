<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Mockery;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase, WithFaker;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
