<!-- IF users.length -->
<ul class="birthdays">
	<!-- BEGIN users -->
    <li><i class="fa fa-birthday-cake"></i> <a href="{relative_path}/user/{users.userslug}">{users.name}</a> <!-- IF users.age --><span>({users.age})</span><!-- ENDIF users.age --></li>
	<!-- END users -->
</ul>
<!-- ENDIF users.length -->