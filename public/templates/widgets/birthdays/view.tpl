<!-- IF users.length -->
<ul class="birthdays">
	<!-- BEGIN users -->
    <li class="birthday-item"><i class="fa fa-birthday-cake"></i> <a class="birthday-name" href="{relative_path}/user/{users.userslug}">{users.name}</a> <!-- IF users.age --><span class="birthday-age">({users.age})</span><!-- ENDIF users.age --></li>
	<!-- END users -->
</ul>
<!-- ENDIF users.length -->