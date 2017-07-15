<!-- IF users.length -->
<ul class="birthdays">
  <!-- BEGIN users -->
  <li class="birthday-item"><span class="birthday-shortdate">{users.bstr}:&nbsp</span>
    <a class="birthday-name" href="{relative_path}/user/{users.userslug}">{users.name}</a>
    <!-- IF users.age --><span class="birthday-age">({users.age})</span><!-- ENDIF users.age -->
    <!-- IF users.today --><i class="fa fa-birthday-cake"></i><!-- ENDIF users.today -->
  </li>
  <!-- END users -->
</ul>
<!-- ENDIF users.length -->
