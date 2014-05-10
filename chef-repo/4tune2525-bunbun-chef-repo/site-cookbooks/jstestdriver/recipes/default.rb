#
# Cookbook Name:: jstestdriver
# Recipe:: default
#
# Copyright 2014, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#

%w(java-1.7.0-openjdk).each do |pkg|
  package pkg do
    action :install
  end
end

directory '/bin/jstestdriver/' do
  action :create
end

bash "download_jstestdriver" do
  cwd '/bin/jstestdriver/'
  code <<-EOH
    wget https://js-test-driver.googlecode.com/files/JsTestDriver-1.3.5.jar
  EOH
end

Cookbook_file "profile-jstestdriver.sh" do
  path "/etc/profile.d/jstestdriver.sh"
end

gem_package "jstdutil" do
  action :install
end


