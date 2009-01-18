#!/usr/bin/env seed

Seed.import_namespace("Clutter");

Clutter.init(null, null);

const GLOBAL_DECEL = 0.2;

Paddle = new GType({
	parent: Clutter.Rectangle.type,
	name: "Paddle",
	init: function(klass)
	{
		// Private
		var velocity = 0;
		
		// Public
		this.update_position = function ()
		{
			this.y += velocity;
			
			// Decelerate
			if(velocity > 0)
			{
				velocity -= 4 - GLOBAL_DECEL;
				
				if(velocity < 0)
					velocity = 0;
			}
			else if(velocity < 0)
			{
				velocity += 4 - GLOBAL_DECEL;
				
				if(velocity > 0)
					velocity = 0;
			}
			
			// Make sure paddle is in bounds
			if(this.y < 10)
			{
				this.y = 10;
				velocity = 0;
			}
			if(this.y > 390)
			{
				this.y = 390;
				velocity = 0;
			}
		};
		
		this.update_velocity = function ()
		{
			if(key_up)
				this.accelerate(-1);
			else if(key_down)
				this.accelerate(1);
		};
		
		this.accelerate = function (direction)
		{
			if(velocity == 0)
				velocity = direction * 5;
			else
				velocity = velocity + (direction*4);
		};
		
		this.set_velocity = function (new_v)
		{
			velocity = new_v;
		};
		
		this.get_velocity = function ()
		{
			return velocity;
		};

		// Implementation
		this.color = green;
		
		this.width = 20;
		this.height = 100;
	}
});

AIPaddle = new GType({
	parent: Paddle.type,
	name: "AIPaddle",
	init: function(klass)
	{
		// Public
		this.update_velocity = function ()
		{
			if((this.y + 50) > (ball.y + 15)) // UP
				this.accelerate(-1);
			else // DOWN
				this.accelerate(1);
		};
	}
});

function angle_from_deg(x)
{
	return (((x) * 1024.0) / 360.0);
}

function circle_paint(actor)
{
	var radius = Clutter.double_to_fixed(actor.width/2);
	
	Clutter.cogl_color(red);
	Clutter.cogl_path_move_to(radius, radius);
	Clutter.cogl_path_arc(radius, radius, radius, radius,
						  angle_from_deg(0),
						  angle_from_deg(360));
	Clutter.cogl_path_close();
	Clutter.cogl_path_fill();	
}

var timeline = new Clutter.Timeline({fps:60, num_frames:30000});

var ballv_x = -2, ballv_y = 4;
var p1v_y = 0, p2v_y = 0;

timeline.signal.new_frame.connect(
	function(timeline, frame_num)
	{
		p_one.update_position();
		p_two.update_position();
		
		p_one.update_velocity();
		p_two.update_velocity();
		
		// Update ball position
		ball.x += ballv_x;
		ball.y += ballv_y;
		
		// Bounce ball off top/bottom walls
		if((ball.y < 0) || (ball.y > (500-30)))
			ballv_y = -ballv_y;
		
		// Bounce ball off paddles
		if((ball.x < 30 && ball.x > 0) && ((ball.y > p_one.y && ball.y < p_one.y+p_one.height) ||
										   (ball.y + ball.height > p_one.y &&
											ball.y + ball.height < p_one.y + p_one.height)))
		{
			ballv_x = -ballv_x;
			ballv_y += p1v_y * 2;
		}
		else if(ball.x < 20)
		{
			Seed.print("YAY YOU LOST!!");
		}
		
		if(((ball.x + ball.width) > 470 && (ball.x + ball.width) < 500) && ((ball.y > p_two.y && ball.y < p_two.y+p_two.height) ||
										   (ball.y + ball.height > p_two.y &&
											ball.y + ball.height < p_two.y + p_two.height)))
		{
			ballv_x = -ballv_x;
			ballv_y += p2v_y * 2;
		}
		else if(ball.x > 480)
		{
			Seed.print("YAY COMPUTER LOST!!");
		}
	});

timeline.start();

var stage = new Clutter.Stage();
stage.signal.hide.connect(function(){Clutter.main_quit()});
stage.set_size(500,500);
var transp = new Clutter.Color();
var green = new Clutter.Color();
Clutter.color_parse("Green", green);
var red = new Clutter.Color();
Clutter.color_parse("Red", red);
var black = new Clutter.Color();
Clutter.color_parse("Black", black);
stage.color = black;

var p_one = new Paddle();
p_one.y = p_one.x = 10;

var p_two = new AIPaddle();
p_two.y = 10;
p_two.x = 470;

stage.add_actor(p_one);
stage.add_actor(p_two);

var ball = new Clutter.Rectangle({color: transp});
ball.signal["paint"].connect(circle_paint);
ball.width = ball.height = 30;
ball.x = ball.y = 300;

stage.add_actor(ball);

key_up = key_down = 0;

stage.signal["key_press_event"].connect(
	function(stage, event)
	{
		if(event.key.keyval == 65362) // UP
			key_up = 1;
		else if(event.key.keyval == 65364) // DOWN
			key_down = 1;

		return true;
	});

stage.signal["key_release_event"].connect(
	function(stage, event)
	{
		if(event.key.keyval == 65362) // UP
			key_up = 0;
		else if(event.key.keyval == 65364) // DOWN
			key_down = 0;
		
		return true;
	});

stage.show_all();
Clutter.main();