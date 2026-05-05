@echo off

cd /d C:\Projects\cezaevi-haklari-site

python scraper\scraper.py

for %%I in (reports\v4_guncel_yeni_linkler.txt) do (
    if %%~zI gtr 0 (
        echo Yeni karar bulundu. Vercel deploy tetikleniyor...

        powershell -Command "Invoke-WebRequest -Uri https://api.vercel.com/v1/integrations/deploy/prj_Z4VhvUgp0EujEMasShM1H2zaom5f/TyvOvHzcd8 -Method POST -UseBasicParsing"
    ) else (
        echo Yeni karar yok. Deploy yapilmadi.
    )
)