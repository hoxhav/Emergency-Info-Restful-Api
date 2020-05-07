<?php
//supress warnings & errors
error_reporting(0); 
//set the base of the url we want to use
define('HOSTNAME', 'http://simon.ist.rit.edu:8080/Services/resources/ESD');

//access the api (we have to send in a leading '/')
if (filter_has_var(INPUT_POST, 'path')) {
    $hold = explode('?', filter_input(INPUT_POST, 'path', FILTER_SANITIZE_URL));
    $path = $hold[0];
    $post = $hold[1] . "&ip=" . filter_input(INPUT_SERVER, 'REMOTE_ADDR', FILTER_VALIDATE_IP);
    $url = HOSTNAME . $path;
    /*
     * Setting Up the Client Uniform Resource Locator - curl
     */
    // initiate curl
    $session = curl_init($url);
    // do not include a header in the return
    curl_setopt($session, CURLOPT_HEADER, false);
    // return the response (we want to capture it in a variable $xml)
    curl_setopt($session, CURLOPT_RETURNTRANSFER, true); //if false the response will be printed 
    curl_setopt($session, CURLOPT_POST, 1);
    curl_setopt($session, CURLOPT_POSTFIELDS, $post);
} else {
    $url = HOSTNAME . filter_input(INPUT_GET, 'path', FILTER_SANITIZE_URL);
    $session = curl_init($url);
    curl_setopt($session, CURLOPT_HEADER, false);
    curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
}
// execute
$xml = curl_exec($session);
// close
curl_close($session);

header("Content-Type: text/xml");
echo $xml;
