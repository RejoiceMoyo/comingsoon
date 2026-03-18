Set-Location "c:\Users\fossil lap\Documents\GitHub\comingsoon"

$initScript = "    <script>if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');</script>"
$gtagMarker = "    <!-- Google tag (gtag.js) -->"
$oldFontFam = " style=""font-family:'Cormorant Garamond',serif"""
$oldFontSz  = 'class="text-[11px] text-gray-400 leading-relaxed" style="font-size:0.65rem"'
$newFontSz  = 'class="text-[11px] text-gray-400 leading-relaxed"'

$changed = 0
$files = Get-ChildItem -Path "public" -Recurse -Filter "*.html"
foreach ($f in $files) {
    $path    = $f.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $orig    = $content

    # 1. Add dark-mode init script if missing
    if (($content.IndexOf("localStorage.getItem") -lt 0) -and ($content.IndexOf($gtagMarker) -ge 0)) {
        $content = $content.Replace($gtagMarker, "$initScript`n$gtagMarker")
    }

    # 2. Remove redundant font-family inline style (font-serif class covers it)
    if ($content.IndexOf($oldFontFam) -ge 0) {
        $content = $content.Replace($oldFontFam, "")
    }

    # 3. Remove conflicting font-size inline style where text-[11px] class exists
    if ($content.IndexOf($oldFontSz) -ge 0) {
        $content = $content.Replace($oldFontSz, $newFontSz)
    }

    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        $changed++
        Write-Host "Updated: $($f.FullName.Replace('c:\Users\fossil lap\Documents\GitHub\comingsoon\', ''))"
    }
}
Write-Host ""
Write-Host "Total files updated: $changed"
