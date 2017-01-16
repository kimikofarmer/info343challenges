# INFO 343 Challenges Repository

This repository contains all the starter files for your INFO 343 challenges. You should fork this repository into your own account and use that forked copy as your master repository. Follow the instructions in the [Managing Your Files](https://info343.ischool.uw.edu/2015/challenges/git) self-guided challenge.

# Getting Changes from the Upstream Repository

I may need to add or change things in this starter repository later in the quarter. Because you've already forked it, you will need to add the original repository as another git remote to pull changes from it. If I tell you that I've changed something, you should follow these steps to add the new upstream remote.

First execute the following to see your current set of remotes:

    git remote -v

If there is already a remote named `upstream` then you have already added the upstream remote. If you don't see a remote named `upstream`, execute this command to add it:

    git remote add upstream https://github.com/INFO343-2015/challenges.git

Now use git to pull any new commits that have been made to the master branch on the upstream remote:

    git pull upstream master

This will fetch the new commits and merge them into your repository files. After that finishes, you can push the new commits back up to your forked repository (the `origin`) using the command:

    git push origin

