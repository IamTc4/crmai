#!/bin/bash
echo "Starting Growth OS backend proxy..."
echo "To make it accessible over LAN, configure your IP in assets/js/config.js"
node proxy/server.js
