gogogo
======
Spoof GPS; simulate transit. :ghost: Where would you like to Go. :ghost:
![GoGoGo](http://i.giphy.com/cpF4AiOo2Z212.gif)


Usage
-----
Get `gogogo` sources
```
git clone https://github.com/BzFTMxc/gogogo
```
Install server dependencies using `pip`
```
cd gogogo/server
pip install -r requirements.txt
```
Using gogogo with Genymotion   
For using gogogo with Genymotion; follow installation instructions at [Genymotion installation guide](https://docs.genymotion.com/Content/01_Get_Started/Installation.htm)   
   
Update configuration  
Set database settings, Google Maps API key and path to Genymotion binaries.   
```
#
# Configuration Settings
#

[routing]

[datastores]
DEFAULT.dialect = mysql
DEFAULT.driver =
DEFAULT.host = localhost
DEFAULT.port = 3306
DEFAULT.database = gogogo
DEFAULT.username = root
DEFAULT.password = 
DEFAULT.pool_size = 5


[google_maps]
api_key = <my-google-maps-api-key>


[genymotion]
genyshell_path = /Applications/Genymotion Shell.app/Contents/MacOS/genyshell
```
Run gogogo server
```
python wsgi.py
```


Contributors
------------
* Abhay Arora [@BzFTMxc](https://github.com/BzFTMxc) (@dumbstark ..earlier)


License
-------
gogogo is licensed under the Apache License, Version 2.0. See
[LICENSE](https://github.com/BzFTMxc/gogogo/blob/master/LICENSE) for the full
license text.

