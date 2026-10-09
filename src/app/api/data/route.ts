import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET() {
  try {
    const wsRes = await query('SELECT * FROM workspaces LIMIT 1');
    const workspace = wsRes.rows[0];

    const peopleRes = await query('SELECT * FROM people ORDER BY id ASC');
    const people = peopleRes.rows.map((p) => ({
      id: p.id,
      workspaceId: p.workspace_id,
      fullName: p.full_name,
      displayName: p.display_name,
      gender: p.gender,
      birthDate: p.birth_date,
      deathDate: p.death_date,
      isDeceased: p.is_deceased,
      biography: p.biography,
      address: p.address,
      phone: p.phone,
      email: p.email,
      instagram: p.instagram,
      photoUrl: p.photo_url,
      photoZoom: p.photo_zoom ? parseFloat(p.photo_zoom) : 1,
      photoOffsetX: p.photo_offset_x ? parseFloat(p.photo_offset_x) : 0,
      photoOffsetY: p.photo_offset_y ? parseFloat(p.photo_offset_y) : 0,
      linkedUserId: p.linked_user_id,
      verificationStatus: p.verification_status,
      notes: p.notes,
    }));

    const pcRes = await query('SELECT * FROM parent_child_relationships ORDER BY id ASC');
    const parentChildRelations = pcRes.rows.map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      parentPersonId: r.parent_person_id,
      childPersonId: r.child_person_id,
      parentRole: r.parent_role,
      parentageType: r.parentage_type,
      notes: r.notes,
      verifiedStatus: r.verified_status,
    }));

    const partRes = await query('SELECT * FROM partnership_relationships ORDER BY id ASC');
    const partnerships = partRes.rows.map((p) => ({
      id: p.id,
      workspaceId: p.workspace_id,
      personAId: p.person_a_id,
      personBId: p.person_b_id,
      relationshipType: p.relationship_type,
      startDate: p.start_date,
      endDate: p.end_date,
      status: p.status,
      notes: p.notes,
    }));

    const logsRes = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    const auditLogs = logsRes.rows.map((l) => ({
      id: l.id,
      workspaceId: l.workspace_id,
      actorUserId: l.actor_user_id,
      actorName: l.actor_name,
      actorRole: l.actor_role,
      action: l.action,
      targetType: l.target_type,
      targetId: l.target_id,
      timestamp: l.timestamp,
      summary: l.summary,
    }));

    return NextResponse.json({
      success: true,
      workspace,
      people,
      parentChildRelations,
      partnerships,
      auditLogs,
    });
  } catch (error: any) {
    console.error('Fetch data error:', error);
    return NextResponse.json({ error: 'Gagal memuat data dari PostgreSQL.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data, actor } = body;

    // RBAC validation
    if (!actor || actor.role === 'client') {
      return NextResponse.json(
        { error: 'Akses ditolak: Akun Client hanya memiliki hak baca (Read-only).' },
        { status: 403 }
      );
    }

    if (action === 'CREATE_PERSON') {
      await query(
        `INSERT INTO people (
          id, workspace_id, full_name, display_name, gender, birth_date, death_date,
          is_deceased, biography, address, phone, email, instagram, photo_url,
          photo_zoom, photo_offset_x, photo_offset_y, linked_user_id, verification_status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          data.id,
          data.workspaceId,
          data.fullName,
          data.displayName || null,
          data.gender,
          data.birthDate || null,
          data.deathDate || null,
          data.isDeceased,
          data.biography || null,
          data.address || null,
          data.phone || null,
          data.email || null,
          data.instagram || null,
          data.photoUrl || null,
          data.photoZoom || 1,
          data.photoOffsetX || 0,
          data.photoOffsetY || 0,
          data.linkedUserId || null,
          data.verificationStatus,
          data.notes || null,
        ]
      );
    } else if (action === 'UPDATE_PERSON') {
      await query(
        `UPDATE people SET
          full_name = $1, display_name = $2, gender = $3, birth_date = $4, death_date = $5,
          is_deceased = $6, biography = $7, address = $8, phone = $9, email = $10,
          instagram = $11, photo_url = $12, photo_zoom = $13, photo_offset_x = $14, photo_offset_y = $15,
          linked_user_id = $16, verification_status = $17
        WHERE id = $18`,
        [
          data.fullName,
          data.displayName || null,
          data.gender,
          data.birthDate || null,
          data.deathDate || null,
          data.isDeceased,
          data.biography || null,
          data.address || null,
          data.phone || null,
          data.email || null,
          data.instagram || null,
          data.photoUrl || null,
          data.photoZoom || 1,
          data.photoOffsetX || 0,
          data.photoOffsetY || 0,
          data.linkedUserId || null,
          data.verificationStatus,
          data.id,
        ]
      );
    } else if (action === 'DELETE_PERSON') {
      await query('DELETE FROM people WHERE id = $1', [data.id]);
    } else if (action === 'CREATE_PARENT_CHILD') {
      await query(
        `INSERT INTO parent_child_relationships (
          id, workspace_id, parent_person_id, child_person_id, parent_role, parentage_type, notes, verified_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.id,
          data.workspaceId,
          data.parentPersonId,
          data.childPersonId,
          data.parentRole,
          data.parentageType,
          data.notes || null,
          data.verifiedStatus,
        ]
      );
    } else if (action === 'DELETE_PARENT_CHILD') {
      await query('DELETE FROM parent_child_relationships WHERE id = $1', [data.id]);
    } else if (action === 'CREATE_PARTNERSHIP') {
      await query(
        `INSERT INTO partnership_relationships (
          id, workspace_id, person_a_id, person_b_id, relationship_type, start_date, end_date, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          data.id,
          data.workspaceId,
          data.personAId,
          data.personBId,
          data.relationshipType,
          data.startDate || null,
          data.endDate || null,
          data.status,
          data.notes || null,
        ]
      );
    } else if (action === 'DELETE_PARTNERSHIP') {
      await query('DELETE FROM partnership_relationships WHERE id = $1', [data.id]);
    } else if (action === 'UPDATE_WORKSPACE') {
      if (actor.role !== 'superadmin') {
        return NextResponse.json({ error: 'Hanya Superadmin yang berwenang mengubah nama ruang keluarga.' }, { status: 403 });
      }
      await query('UPDATE workspaces SET name = $1, description = $2', [
        data.name,
        data.description || null,
      ]);
    } else if (action === 'LINK_CLIENT') {
      if (actor.role !== 'superadmin' && actor.role !== 'admin') {
        return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
      }
      // data: { userId, personId }
      await query('UPDATE users SET linked_person_id = $1 WHERE id = $2', [data.personId, data.userId]);
      await query('UPDATE people SET linked_user_id = $1 WHERE id = $2', [data.userId, data.personId]);
    }

    // Insert audit log
    if (body.auditLog) {
      const l = body.auditLog;
      await query(
        `INSERT INTO audit_logs (
          id, workspace_id, actor_user_id, actor_name, actor_role, action, target_type, target_id, timestamp, summary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          l.id,
          l.workspaceId,
          l.actorUserId,
          l.actorName,
          l.actorRole,
          l.action,
          l.targetType,
          l.targetId,
          l.timestamp,
          l.summary,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Data mutation error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan perubahan ke PostgreSQL.' }, { status: 500 });
  }
}
