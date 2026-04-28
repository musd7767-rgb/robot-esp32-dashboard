#!/usr/bin/env python3
"""
ESP32 Simulator for Robot Dashboard
This script simulates a real ESP32 microcontroller sending data to Adafruit IO.
It mimics the behavior of a master robot sending its own data and follower robot data.

Usage:
    python3 esp32_simulator.py --aio-key YOUR_AIO_KEY --aio-username YOUR_USERNAME

Requirements:
    pip install adafruit-io requests
"""

import argparse
import time
import random
import math
import json
from datetime import datetime

try:
    from Adafruit_IO import Client, Feed
    ADAFRUIT_IO_AVAILABLE = True
except ImportError:
    ADAFRUIT_IO_AVAILABLE = False
    print("⚠️  Adafruit IO library not found. Install with: pip install adafruit-io")

import requests


class ESP32Simulator:
    """Simulates an ESP32 master robot sending data to Adafruit IO"""

    def __init__(self, aio_username=None, aio_key=None, use_http=False):
        self.aio_username = aio_username
        self.aio_key = aio_key
        self.use_http = use_http
        self.client = None
        self.feeds = {}
        
        # Initialize Adafruit IO client if credentials provided
        if aio_username and aio_key and not use_http:
            try:
                self.client = Client(aio_username, aio_key)
                print(f"✅ Connected to Adafruit IO as {aio_username}")
            except Exception as e:
                print(f"❌ Failed to connect to Adafruit IO: {e}")
                self.use_http = True
        
        # Robot state variables
        self.master_voltage = 12.0
        self.master_current = 0.5
        self.master_temperature = 35.0
        self.master_battery = 85.0
        self.master_motor_status = "stopped"
        
        self.follower_voltage = 11.8
        self.follower_current = 0.3
        self.follower_temperature = 32.0
        self.follower_battery = 78.0
        self.follower_motor_status = "stopped"
        
        # Simulation variables
        self.time_elapsed = 0
        self.motor_activity_cycle = 0

    def generate_realistic_data(self):
        """Generate realistic sensor data that changes over time"""
        self.time_elapsed += 1
        self.motor_activity_cycle = (self.motor_activity_cycle + 1) % 20
        
        # Simulate motor activity cycles (every 20 seconds)
        if self.motor_activity_cycle < 5:
            # Motor accelerating
            motor_load = (self.motor_activity_cycle / 5.0) * 0.8
            self.master_motor_status = "forward"
        elif self.motor_activity_cycle < 10:
            # Motor at full speed
            motor_load = 0.8
            self.master_motor_status = "forward"
        elif self.motor_activity_cycle < 15:
            # Motor decelerating
            motor_load = (1.0 - (self.motor_activity_cycle - 10) / 5.0) * 0.8
            self.master_motor_status = "forward"
        else:
            # Motor stopped
            motor_load = 0.0
            self.master_motor_status = "stopped"
        
        # Master robot data with realistic variations
        base_voltage = 12.0 + random.uniform(-0.3, 0.3)
        self.master_voltage = max(10.5, min(13.5, base_voltage - motor_load * 0.5))
        
        self.master_current = 0.3 + motor_load * 3.0 + random.uniform(-0.2, 0.2)
        self.master_current = max(0.0, min(4.0, self.master_current))
        
        # Temperature increases with motor load
        self.master_temperature = 30.0 + motor_load * 20.0 + random.uniform(-1, 1)
        self.master_temperature = max(25.0, min(70.0, self.master_temperature))
        
        # Battery decreases slowly
        self.master_battery = max(5.0, self.master_battery - 0.01)
        
        # Follower robot data (slightly different pattern, lower activity)
        follower_load = motor_load * 0.6  # Follower has less load
        
        self.follower_voltage = 11.8 + random.uniform(-0.2, 0.2) - follower_load * 0.3
        self.follower_voltage = max(10.5, min(13.0, self.follower_voltage))
        
        self.follower_current = 0.2 + follower_load * 2.0 + random.uniform(-0.1, 0.1)
        self.follower_current = max(0.0, min(3.0, self.follower_current))
        
        self.follower_temperature = 28.0 + follower_load * 15.0 + random.uniform(-0.5, 0.5)
        self.follower_temperature = max(25.0, min(65.0, self.follower_temperature))
        
        self.follower_battery = max(5.0, self.follower_battery - 0.008)
        
        # Follower motor status follows master with slight delay
        if motor_load > 0.1:
            self.follower_motor_status = "forward"
        else:
            self.follower_motor_status = "stopped"

    def prepare_data_payload(self):
        """Prepare data payload to send to Adafruit IO"""
        master_power = self.master_voltage * self.master_current
        follower_power = self.follower_voltage * self.follower_current
        
        payload = {
            "master": {
                "voltage": round(self.master_voltage, 2),
                "current": round(self.master_current, 2),
                "power": round(master_power, 2),
                "temperature": round(self.master_temperature, 1),
                "battery": round(self.master_battery, 1),
                "motor_status": self.master_motor_status,
                "timestamp": datetime.now().isoformat()
            },
            "follower": {
                "voltage": round(self.follower_voltage, 2),
                "current": round(self.follower_current, 2),
                "power": round(follower_power, 2),
                "temperature": round(self.follower_temperature, 1),
                "battery": round(self.follower_battery, 1),
                "motor_status": self.follower_motor_status,
                "timestamp": datetime.now().isoformat()
            }
        }
        return payload

    def ensure_feeds_exist(self):
        """Check if required feeds exist, and create them if they don't"""
        if not self.client:
            return
        
        required_feeds = ["robot-master-data", "robot-follower-data"]
        for feed_key in required_feeds:
            try:
                self.client.feeds(feed_key)
                print(f"✅ Feed '{feed_key}' exists.")
            except Exception:
                print(f"ℹ️  Feed '{feed_key}' not found. Attempting to create it...")
                try:
                    self.client.create_feed(Feed(name=feed_key.replace('-', ' ').title(), key=feed_key))
                    print(f"✨ Created feed '{feed_key}' successfully.")
                except Exception as e:
                    print(f"❌ Failed to create feed '{feed_key}': {e}")

    def send_via_adafruit_io(self, payload):
        """Send data to Adafruit IO using the client library"""
        if not self.client:
            return False
        
        master_feed_key = "robot-master-data"
        follower_feed_key = "robot-follower-data"
        
        try:
            # Send master data
            master_json = json.dumps(payload["master"])
            self.client.send(master_feed_key, master_json)
            
            # Send follower data
            follower_json = json.dumps(payload["follower"])
            self.client.send(follower_feed_key, follower_json)
            
            return True
        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg:
                print(f"❌ Error 404: Feed not found. Make sure feeds '{master_feed_key}' and '{follower_feed_key}' exist in Adafruit IO.")
                print("💡 Hint: The script will try to create them once at startup if you restart it.")
            else:
                print(f"❌ Error sending to Adafruit IO: {e}")
            return False

    def send_via_http(self, payload):
        """Send data to Adafruit IO using HTTP REST API"""
        if not self.aio_username or not self.aio_key:
            print("❌ Adafruit IO credentials not provided. Use --aio-username and --aio-key")
            return False
        
        try:
            base_url = f"https://io.adafruit.com/api/v2/{self.aio_username}/feeds"
            headers = {"X-AIO-Key": self.aio_key, "Content-Type": "application/json"}
            
            # Send master data
            master_feed_url = f"{base_url}/robot-master-data/data"
            master_data = {"value": json.dumps(payload["master"])}
            response = requests.post(master_feed_url, json=master_data, headers=headers, timeout=5)
            
            if response.status_code not in [200, 201]:
                print(f"⚠️  Master data send status: {response.status_code}")
            
            # Send follower data
            follower_feed_url = f"{base_url}/robot-follower-data/data"
            follower_data = {"value": json.dumps(payload["follower"])}
            response = requests.post(follower_feed_url, json=follower_data, headers=headers, timeout=5)
            
            if response.status_code not in [200, 201]:
                print(f"⚠️  Follower data send status: {response.status_code}")
            
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ HTTP Error: {e}")
            return False

    def display_data(self, payload):
        """Display current data in terminal"""
        print("\n" + "="*70)
        print(f"⏰ {datetime.now().strftime('%H:%M:%S')} - Cycle {self.time_elapsed}")
        print("="*70)
        
        print("\n👑 MASTER ROBOT DATA:")
        print(f"  Voltage:      {payload['master']['voltage']:6.2f} V")
        print(f"  Current:      {payload['master']['current']:6.2f} A")
        print(f"  Power:        {payload['master']['power']:6.2f} W")
        print(f"  Temperature:  {payload['master']['temperature']:6.1f} °C")
        print(f"  Battery:      {payload['master']['battery']:6.1f} %")
        print(f"  Motor Status: {payload['master']['motor_status']:>10}")
        
        print("\n🤝 FOLLOWER ROBOT DATA:")
        print(f"  Voltage:      {payload['follower']['voltage']:6.2f} V")
        print(f"  Current:      {payload['follower']['current']:6.2f} A")
        print(f"  Power:        {payload['follower']['power']:6.2f} W")
        print(f"  Temperature:  {payload['follower']['temperature']:6.1f} °C")
        print(f"  Battery:      {payload['follower']['battery']:6.1f} %")
        print(f"  Motor Status: {payload['follower']['motor_status']:>10}")

    def run(self, interval=1, duration=None):
        """
        Run the simulator
        
        Args:
            interval: Seconds between data sends (default: 1)
            duration: Total seconds to run (default: None = infinite)
        """
        print("\n" + "="*70)
        print("🤖 ESP32 SIMULATOR FOR ROBOT DASHBOARD")
        print("="*70)
        
        # Ensure feeds exist before starting
        if self.client:
            self.ensure_feeds_exist()
            
        print(f"📡 Sending data every {interval} second(s)")
        if duration:
            print(f"⏱️  Running for {duration} seconds")
        else:
            print("⏱️  Running indefinitely (Press Ctrl+C to stop)")
        print("="*70 + "\n")
        
        start_time = time.time()
        
        try:
            while True:
                # Generate new data
                self.generate_realistic_data()
                payload = self.prepare_data_payload()
                
                # Display data
                self.display_data(payload)
                
                # Send data
                if self.use_http:
                    self.send_via_http(payload)
                elif self.client:
                    self.send_via_adafruit_io(payload)
                else:
                    print("ℹ️  (Data not sent - no Adafruit IO connection)")
                
                # Check if duration exceeded
                if duration and (time.time() - start_time) > duration:
                    print("\n✅ Simulation completed!")
                    break
                
                # Wait for next interval
                time.sleep(interval)
        
        except KeyboardInterrupt:
            print("\n\n✋ Simulator stopped by user")


def main():
    parser = argparse.ArgumentParser(
        description="Simulate ESP32 robot sending data to Adafruit IO",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run without sending to Adafruit IO (just display data)
  python3 esp32_simulator.py

  # Send to Adafruit IO using credentials
  python3 esp32_simulator.py --aio-username YOUR_USERNAME --aio-key YOUR_AIO_KEY

  # Send data every 2 seconds for 60 seconds
  python3 esp32_simulator.py --aio-username YOUR_USERNAME --aio-key YOUR_AIO_KEY --interval 2 --duration 60
        """
    )
    
    parser.add_argument(
        "--aio-username",
        help="Adafruit IO username"
    )
    parser.add_argument(
        "--aio-key",
        help="Adafruit IO key"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1,
        help="Seconds between data sends (default: 1)"
    )
    parser.add_argument(
        "--duration",
        type=float,
        help="Total seconds to run (default: infinite)"
    )
    parser.add_argument(
        "--http",
        action="store_true",
        help="Use HTTP REST API instead of client library"
    )
    
    args = parser.parse_args()
    
    # Create and run simulator
    simulator = ESP32Simulator(
        aio_username=args.aio_username,
        aio_key=args.aio_key,
        use_http=args.http
    )
    simulator.run(interval=args.interval, duration=args.duration)


if __name__ == "__main__":
    main()
