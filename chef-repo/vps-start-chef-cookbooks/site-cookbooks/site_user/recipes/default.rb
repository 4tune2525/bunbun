#
# Cookbook Name:: site_user
# Recipe:: default
#
# Copyright 2014, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#

user_account '4tune2525' do
  action :create
  ssh_keys ['ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAvibmK4XB/+P2rpCth20wKHfmg8CsHdq2DRHZNRjcgSQNEq/8NEOGLgxA0WsfPoyRB0zt4KTUwt559BC2L/pKPuTEQaXbBmo0cOhY3i79sO+DerscC7WhM3vM+udi48XwjStrGw35KCukl69jde8xRTYckgtkrxDh8aFy9AKoYWCzvAuoAZuXstPXJ5OZef43pCOGIcS3vi/NkP0RIqlR1dfj/y6k3VO6sfUnm8Ze5B6CxPQGlFuLrV+reMwlMVR1ErXZkhr1ki/nvHRwhqfDN8wZ/rQExYrlhkdVg2DMrgcZfeAY+iajTku0tz9R/FaQ1s1lwa+3VW8ZGZwEsIIMpw== 4tune2525@gmail.com']
end



