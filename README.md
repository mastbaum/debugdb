SNO+ Electronics Debugging Database
===================================
Results of all electronics testing through penn_daq are automatically logged to this database. CouchDB views provide a UI to the datums.

Installation
------------
Dependencies:
 * Apache CouchDB v1.1.0 or higher (http://couchdb.apache.org)
 * kanso (http://kansojs.com)

From within the project directory,

    $ kanso push <database name>

and optionally

    $ kanso pushadmin <database name>

