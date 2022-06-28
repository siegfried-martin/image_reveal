<?php

function handle_login() {
    $_SESSION["game_token"] = strval(rand(1000000, 9999999));
}



?>