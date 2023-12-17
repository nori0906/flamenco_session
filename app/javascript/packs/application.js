// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import * as ActiveStorage from "@rails/activestorage"
import "channels"
// 23/12/17 profiles/show.html.erbの非公開ボタンクリックができない問題により対応
import "jquery"

import "bootstrap";
import "../stylesheets/application.scss";
// fontawesome追加
import "@fortawesome/fontawesome-free/js/all";

const images = require.context('../images/', true)
const imagePath = name => images(name, true)

Rails.start()
ActiveStorage.start()
console.log("Hello from Webpacker");
