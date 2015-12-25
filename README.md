# NodeBB Widget: Birthdays

Efficient widget to output all today's birthdays of community members.

![Version](https://img.shields.io/npm/v/nodebb-widget-ns-birthdays.svg)
![Dependencies](https://david-dm.org/NicolasSiver/nodebb-widget-ns-birthdays.svg)
![bitHound Score](https://www.bithound.io/github/NicolasSiver/nodebb-widget-ns-birthdays/badges/score.svg)
![Code Climate](https://img.shields.io/codeclimate/github/NicolasSiver/nodebb-widget-ns-birthdays.svg)
![Travis](https://travis-ci.org/NicolasSiver/nodebb-widget-ns-birthdays.svg?branch=master)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
 

- [Customization](#customization)
- [How does it work?](#how-does-it-work)
- [TODO](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Customization

## How does it work?

1. At start, job will be triggered to check all users that have birthday today. It's an async process. By design it will take some time.
2. Every day at midnight (Server Time), job to find today's birthdays is fired
3. Widget returns birthdays that are stored in memory, It's fast and efficient.

Optimisations:

- to store today's birthdays in memory
- to check for birthdays only once per day

## TODO

- ACP: Provide setting to setup timezone
- ACP: Provide setting to setup time to check for birthdays
- ACP: Ability to setup presentation
- ACP: limit number of birthdays
- Calculate middle age
- Update in real time