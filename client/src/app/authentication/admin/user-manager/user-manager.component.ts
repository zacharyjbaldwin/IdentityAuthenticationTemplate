import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { EditRolesModalComponent } from 'src/app/modals/edit-roles-modal/edit-roles-modal.component';
import { User } from 'src/app/models/user';
import { RolesService } from 'src/app/services/roles.service';
import { UserManagerService } from 'src/app/services/user-manager.service';

@Component({
  selector: 'user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss']
})
export class UserManagerComponent implements OnInit {

  public users: User[] | undefined;

  constructor(
    private modalService: BsModalService,
    private rolesService: RolesService,
    private toastr: ToastrService,
    private userManager: UserManagerService
  ) { }

  private editRolesModal?: BsModalRef;

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userManager.getUsers().subscribe({
      next: users => { this.users = users; }
    });
  }

  public setRole(user: User, role: string) {
    this.userManager.updateUser(user.userId, { role: role }).subscribe({
      next: () => { this.loadUsers(); }
    })
  }

  public deleteUser(user: User) {
    this.userManager.deleteUser(user.userId).subscribe({
      next: () => { this.loadUsers(); }
    })
  }

  public openEditRolesModal(user: User): void {
    this.editRolesModal = this.modalService.show(EditRolesModalComponent, { class: 'modal-md', initialState: { user: user } });
    (this.editRolesModal.content as EditRolesModalComponent).affirm.subscribe({
      next: (roles: string[]) => {
        this.setRoles(user, roles);
      }
    })
  }

  private setRoles(user: User, roles: string[]): void {
    this.rolesService.setRolesForUser(user, roles).subscribe({
      next: () => {
        this.loadUsers();
        this.toastr.success('Saved roles!');
      },
      error: () => {
        this.toastr.error('Failed to save roles. Please try again later.');
      }
    })
  }

}
