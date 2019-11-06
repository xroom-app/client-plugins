#!/usr/bin/env bash

cd ~
mkdir terminal-server

echo "[XROOM] Cloning the repo"
git clone git@github.com:punarinta/xroom-plugins.git xroom-plugins
cp -R xroom-plugins/nisdos/terminal/cli/* terminal-server/
rm -rf xroom-plugins

echo "[XROOM] Installing dependencies"
cd terminal-server
npm i
