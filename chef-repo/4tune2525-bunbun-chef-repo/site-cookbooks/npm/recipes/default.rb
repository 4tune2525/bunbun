#
# Cookbook Name:: npm
# Recipe:: default
#
# Copyright 2014, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#

npm_package "express" do
  action :install
end

npm_package "express-generator" do
  action :install
end

npm_package "socket.io" do
  action :install
end

npm_package "jade" do
  action :install
end


