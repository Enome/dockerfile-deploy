# Colors
default=$(tput sgr0)
green=$(tput setaf 6)
gray=$(tput setaf 8)
red=$(tput setaf 9)

# Alerts
confirm() {
  echo "${green}---> ${default}$1"
}

skipped() {
  echo "${gray}---> Skipped: ${default}$1"
}

warning() {
  echo "${red}---> ${default}$1"
}

assert() {
  if [ "$1" == "$2" ]
    then
      confirm "$3 - ${green}PASSED${default}"
    else
      warning "$3 - ${red}FAILED (${default}\"$1\" is not equal to \"$2\")${default}"
  fi
}

