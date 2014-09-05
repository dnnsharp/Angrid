<?php
    header('Content-type: application/json');
    if($_SERVER['REQUEST_METHOD']==='POST'){
        session_start();
        session_destroy();
        echo '{"angrid":"refresh"}';
    };
?>
