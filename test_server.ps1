$port = 8088
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "SERVER_STARTED_ON_PORT_$port"
$count = 0
while ($listener.IsListening -and $count -lt 2) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    $msg = "Hello from PowerShell HTTP Server! Path: $($req.RawUrl)"
    $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
    $res.ContentType = "text/plain; charset=utf-8"
    $res.ContentLength64 = $buf.Length
    $res.OutputStream.Write($buf, 0, $buf.Length)
    $res.OutputStream.Close()
    $count++
}
$listener.Stop()
$listener.Close()
Write-Output "SERVER_STOPPED"

