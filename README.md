# lisa-webadmin application

Lisa-webadmin is an open source single-page applications (SPA) build with [Vue.js](https://vuejs.org) and [Vuetify](https://vuetifyjs.com) conmponents, to allow configuration of [LISA - Interaktive Auskunft für die Smart City](https://geocom.ch/de-ch/search?q=lisa) using a responsive web design.
It provides the functionality to edit tables in an ArcGIS Online or Portal for ArcGIS secure meb map, where the lisa configuration is stored.

> It may be used as a custom-widget to edit tables in the Web AppBuilder, since the edit tables functionality is (still) not support.

#### Main functionalities:
- User authentication with OAuth 2.0
- Display all secured web map tables in a drop-down list
- Display table items in a [vuetify data table component](https://vuetifyjs.com/en/components/data-tables)
- Provide CRUD operations using [dialog component](https://vuetifyjs.com/en/components/dialogs)
- Esri attachments are supported
- Required value and length validations on input
- Supported field types:
  - esriFieldTypeString
  - esriFieldTypeDate
  - esriFieldTypeInteger
  - coded Values for domain fields
  - relation one-to-many
- Lisa startpage support 

For more information please contact: support@geocom.ch 

#### DISCLAMER: Please be aware this product is not supported. Further information can be found in the license file.

------
## Requirements

* Installation of [Visual Studio Code](https://code.visualstudio.com)
* Installation of [Node.js](https://nodejs.org)
* Installation of [vue CLI 3](https://cli.vuejs.org)
* Installation of [ArcGIS REST JS for Node.js](https://esri.github.io/arcgis-rest-js/api/)

------
## Installation and compilation

1. Clone the Repository
2. Start Visual Studio Code and open the folder with the source code
4. Type ```npm install``` to install the dependencies in the local node_modules folder
3. Type ```npm run serve``` in the console to start the application in development mode
4. Build a web package for production by typing ```npm run build``` in the console

------
## Help

The application expects a secure web map id and the client id of the application. 
> Client id can be obtained by registering an application in [ArcGIS Online](http://doc.arcgis.com/en/arcgis-online/share-maps/add-items.htm#ESRI_SECTION1_0D1B620254F745AE84F394289F8AF44B)

If the provided client id is not valid, an "invalid client_id error 400" is returned from the OAUth2 service.

If the provided client id and secure web map id are valid, the user will be redirected to the Esri OAuth service.
![](https://github.com/geocom-gis/lisa-webadmin/blob/master/lisa-esri-oauth2.png)

After a successfully authentication, a dropdown list with all web map tables is displayed.
![](https://github.com/geocom-gis/lisa-webadmin/blob/master/lisa-tableselect.png)

After the user has selected a table in the dropdown, the items are loaded and displayed in a datatable.
![](https://github.com/geocom-gis/lisa-webadmin/blob/master/lisa-datatable.png)

The user is now able to modify the items.
![](https://github.com/geocom-gis/lisa-webadmin/blob/master/lisa-editform.png)

------
## Known issues

Currently none.
