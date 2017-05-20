Welcome to Storage apllication 
===================


Hey, welocme to my guide.
In this guide I will explain how to deploy the Storage application to ubuntu server using nginx

----------

Install Node-JS 
-------------

Take the Node-JS tar file and extract 
    `sudo tar Jxvf node-v6.10.3-linux-x64.tar.xz`

  Then  make the Node-JS folder as path
  

    sudo cp -r node-v6.10.3-linux-x64/{bin, include, lib, share} /usr/
   You cant check if Node-JS is working by typing `node -v` and `npm`

Install MongoDB 
-------------

Extract your MongoDB tar file 

    sudo tar -xzf <mongodb file name>
    
Make the MongoDB folder as path 

    sudo cp -r <mongodb new folder>/bin /usr/

Run MongoDB  as service
-------------    
Because the installation wasnt done with apt-get, we have to add the mongodb service file.

Go to the systemd services location 

    cd /etc/systemd/system/
Now, make a new `mongodb.service` file 

    sudo nano mongodb.service
In this file you need to to write which user is making the command and what is the command taht we need to write, for example:

    [Service]
    User=danieltalor
    ExecStart=/usr/bin/mongod --dbpath <your db location>
  **Make sure that your db saved data location is with read, write premissions**
Then, reset you service manneger and start the mongo db service

    sudo systemctl daemon-reload
    sudo service mongodb start
To check that the service work, write:

    sudo service mongodb status
   
 
Run out project as service using PM2
-------------  
In the Storage Apllication folder we have a PM2 folder
Install this module using npm, globaly

    npm install -g <pm2 folder location>

Then Run out prject as service:

    pm2 start <your project location> --name "<pm2 project display name>"

Now, we need to set this project as startup:

    pm2 startup <platform, ex:ubuntu>
Then, it may ask you yo add some PATH vars, so add them. This should look like this(Can be diffrent also):

   `sudo su -c "env PATH=$PATH:/opt/node/bin pm2 startup ubuntu -u danieltalor--hp    /home/danieltalor"`

-------    
    
You can check the status of the PM2 service with this command:

    pm2 show <pm2 project dismplay name>
If you want to tail the project loggs, type this:

    pm2 logs <pm2 project name/ pm2 project procces id>



Thats all !

**I wasnt sure if we need nginx, if you need, use this link: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04**

