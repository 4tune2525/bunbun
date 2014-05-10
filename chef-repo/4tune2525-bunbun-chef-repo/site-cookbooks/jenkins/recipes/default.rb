#
# Cookbook Name:: jenkins
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

remote_file "/tmp/" + node["jenkins"]["rpm"] do
  source node["jenkins"]["rpm_url"]
  owner "root"
  group "root"
  mode "0755"
end

package "jenkins" do
  action :install
  source "/tmp/" + node["jenkins"]["rpm"]
end

service "jenkins" do
  action [:enable, :start]
end
