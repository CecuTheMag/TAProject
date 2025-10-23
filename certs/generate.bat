@echo off
echo Generating SSL certificate...
docker run --rm -v "%cd%\certs:/certs" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/selfsigned.key -out /certs/selfsigned.crt -subj "/CN=yourdomain.com"
echo SSL certificate generated successfully!