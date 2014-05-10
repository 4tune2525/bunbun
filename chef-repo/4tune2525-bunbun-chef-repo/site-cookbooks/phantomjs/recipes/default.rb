#
# Cookbook Name:: phantomjs
# Recipe:: default
#
# Copyright 2014, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#

directory '/tmp/phantomjs-jstd/' do
  action :create
end

bash "download_phantomjs-jstd" do
  cwd '/tmp/phantomjs-jstd/'
  code <<-EOH
    wget https://raw.github.com/larrymyers/js-test-driver-phantomjs/master/phantomjs-jstd.js --no-check-certificate
  EOH
end

Cookbook_file "profile-phantomjs.sh" do
  path "/etc/profile.d/phantomjs.sh"
end


