import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Role } from 'src/app/models/role';
import { User } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { RolesService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-edit-roles-modal',
  templateUrl: './edit-roles-modal.component.html',
  styleUrls: ['./edit-roles-modal.component.scss']
})
export class EditRolesModalComponent implements OnInit {
  @Input() public user: User | undefined;
  @Output() public affirm = new EventEmitter<string[]>();
  
  public rolesForm: FormGroup | undefined;

  constructor(private modal: BsModalRef) { }

  ngOnInit(): void {
    this.rolesForm = new FormGroup({
      member: new FormControl(this.user?.roles.includes('Member') ?? false),
      admin: new FormControl(this.user?.roles.includes('Admin') ?? false)
    });
  }

  public onSubmit(): void {
    if (this.rolesForm) {
      let roles = [];
      if (this.rolesForm.value.member) roles.push('Member');
      if (this.rolesForm.value.admin) roles.push('Admin');
      this.affirm.emit(roles);
    }
    this.hide();
  }

  public hide(): void {
    this.modal.hide();
  }
}
