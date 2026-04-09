#!/usr/bin/env bash

MESSAGE=$1

# MODE:
# fast: deploy without clean existing cached data in public directory
# full: deploy with clean existing cached data in public directory
# test-fast: fast mode, but not push to git
# test-full: full mode, but not push to git
MODE=${2:-"fast"}
TEST=false
FULL=false
case $MODE in
'test-full')
  MODE='test-full'
  FULL=true
  TEST=true
;;
'test-fast'|'test')
  MODE='test-fast'
  FULL=false
  TEST=true
;;
'full')
  MODE='full'
  FULL=true
  TEST=false
 ;;
'fast'|*)
  MODE='fast'
  FULL=false
  TEST=false
;;
esac

echo "MODE = $MODE, FULL = $FULL, TEST = $TEST"


# generate blog to pulic dir
echo
echo "Generate blog to public dir"
if [ "$FULL" = true ]; then
  hexo clean
fi
hexo generate


# fetch git data from remote repo to remote directory
# this directory will be reused so we only need to fetch changed data
echo
echo "Fetch git data from remote"
if [ ! -d "remote" ]; then
  git clone --branch gh-pages "git@github.com:Xiaoming-Team/Blog.git" remote
fi
pushd remote > /dev/null
git fetch origin gh-pages
git reset --hard origin/gh-pages
popd > /dev/null


# link .git from remote to public, and let git to track public directory
echo
echo "Track public directory with git"
[ ! -e `pwd`/public/.git ] && ln -s `pwd`/remote/.git `pwd`/public/.git


# message
if [ -z "$MESSAGE" ]; then
  DEPLOY_MESSAGE="Deploy (`date +'%Y-%m-%d %H:%M:%S'`)"
else
  DEPLOY_MESSAGE="$MESSAGE (`date +'%Y-%m-%d %H:%M:%S'`)"
fi


# git push changes from public directory to remote
# reset remote diretory to lasted commit
if [ "$TEST" = true ]; then
  echo
  echo 'Test mode, check the status in public directory'
  echo "MESSAGE: '$MESSAGE'"
  echo "DEPLOY_MESSAGE: '$DEPLOY_MESSAGE'"
else
  echo
  echo "Incremental deploy with git"
  pushd public > /dev/null
  git add .
  git commit -m "$DEPLOY_MESSAGE"
  git push origin HEAD:gh-pages
  popd > /dev/null

  echo
  echo "Set remote directory to lastest"
  pushd remote > /dev/null
  git reset --hard HEAD
  popd > /dev/null
fi
