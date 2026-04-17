<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Enjoy Plus</title>
        <link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,100..900;1,100..900&family=Cairo:wght@200..1000&display=swap" rel="stylesheet">
        @viteReactRefresh
        @vite(['resources/js/src/main.tsx'])
    </head>
    <body class="antialiased">
        <div id="root"></div>
    </body>
</html>
