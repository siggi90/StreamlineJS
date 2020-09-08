# StreamlineJS

Streamline is a web development framework created by Noob Software. This repository is also for Noob Cloud, the "streamline" setting in the config.php file changes whether you use Streamline for Web Development or as Noob Cloud.

An example of a Streamline webpage is https://github.com/siggi90/sl_cv which is a publications/cv website intended for displaying publications. This template is a single user page with a admin/content management interface.

Noob Cloud is the server-side software for Noob Applications. You must sign up for a Noob account to use Noob Cloud to power Noob Applications. Follow these instructions to set up Noob Cloud or Streamline: https://noob.software/support/#index/instruction#32&

For more information visit: https://noob.software/#streamline
and https://noob.software/#cloud

Streamline is a very efficient way to develop web apps/web pages. The support page for the JSON definition is still under construction but in the meanwhile it can be infered from sl_cv template. Streamline allows for complex behaviour with relativly simple definitions. The corrosponding PHP code must be coded from scratch, but no JavaScript coding is neccessary. Streamline also allows custom code and custom frames. If you want to extend the functionality beyond what Streamline has to offer.

Updating can be performed within the /cloud/ app in the overview tab. By clicking Download and install updates. Note the apache user must have write permissions to perform updates this way. As files and folders may have to be created. Remember to set the streamline option to true in base/config.php if you only want to use Streamline for web development, else you get server-side software for Noob Software Apps installed along side Streamline.

Streamline web pages are fully ajaxed, which means you never have to reload the web page. Link hashes are used to navigate through the web page without reloading the page so navigated pages are placed in the history of the browser and can be bookmarked and the back button navigates to the last page. Animations can be applied when switching between pages. 

Setting up reCaptcha: https://noob.software/support/#index/instruction#36&